from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal, InvalidOperation
from .models import TrackedProduct, PriceHistory, PriceAlert
from .serializers import TrackedProductSerializer, PriceAlertSerializer
from . import amazon_service
import re

def parse_price(price_str):
    if not price_str:
        return None
    cleaned = re.sub(r'[^\d.]', '', str(price_str))
    try:
        return Decimal(cleaned)
    except (InvalidOperation, ValueError):
        return None

@api_view(['GET'])
def search_products(request):
    query = request.GET.get('q', '')
    page = request.GET.get('page', 1)
    country = request.GET.get('country', 'US')
    if not query:
        return Response({'error': 'Query parameter q is required'}, status=400)
    result = amazon_service.search_products(query, page, country)
    return Response(result)

@api_view(['GET'])
def product_details(request, asin):
    country = request.GET.get('country', 'US')
    result = amazon_service.get_product_details(asin, country)
    return Response(result)

@api_view(['GET'])
def product_offers(request, asin):
    result = amazon_service.get_product_offers(asin)
    return Response(result)

@api_view(['GET'])
def tracked_products(request):
    products = TrackedProduct.objects.all().order_by('-updated_at')
    serializer = TrackedProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def track_product(request):
    asin = request.data.get('asin')
    if not asin:
        return Response({'error': 'ASIN required'}, status=400)
    
    details = amazon_service.get_product_details(asin)
    if not details.get('success'):
        return Response({'error': details.get('error', 'Failed to fetch product')}, status=400)
    
    current_price = parse_price(details.get('current_price'))
    original_price = parse_price(details.get('original_price'))
    
    product, created = TrackedProduct.objects.get_or_create(
        asin=asin,
        defaults={
            'title': details.get('title', '')[:500],
            'image_url': details.get('image_url', '')[:500],
            'current_price': current_price,
            'original_price': original_price,
            'product_url': details.get('product_url', '')[:500],
        }
    )
    
    if not created:
        product.title = details.get('title', '')[:500]
        product.image_url = details.get('image_url', '')[:500]
        product.current_price = current_price
        product.original_price = original_price
        product.product_url = details.get('product_url', '')[:500]
        product.save()
    
    if current_price:
        PriceHistory.objects.create(product=product, price=current_price)
    
    serializer = TrackedProductSerializer(product)
    return Response({'created': created, 'product': serializer.data}, status=201 if created else 200)

@api_view(['DELETE'])
def untrack_product(request, asin):
    try:
        product = TrackedProduct.objects.get(asin=asin)
        product.delete()
        return Response({'message': 'Product removed from tracking'})
    except TrackedProduct.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['POST'])
def refresh_product(request, asin):
    try:
        product = TrackedProduct.objects.get(asin=asin)
    except TrackedProduct.DoesNotExist:
        return Response({'error': 'Product not tracked'}, status=404)
    
    details = amazon_service.get_product_details(asin)
    if not details.get('success'):
        return Response({'error': 'Failed to refresh'}, status=400)
    
    new_price = parse_price(details.get('current_price'))
    if new_price:
        product.current_price = new_price
        product.save()
        PriceHistory.objects.create(product=product, price=new_price)
        
        # Check alerts
        for alert in product.alerts.filter(is_active=True, triggered=False):
            if new_price <= alert.target_price:
                alert.triggered = True
                alert.save()
    
    serializer = TrackedProductSerializer(product)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
def product_alerts(request, asin):
    try:
        product = TrackedProduct.objects.get(asin=asin)
    except TrackedProduct.DoesNotExist:
        return Response({'error': 'Product not tracked'}, status=404)
    
    if request.method == 'GET':
        alerts = product.alerts.all()
        serializer = PriceAlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        target_price = request.data.get('target_price')
        email = request.data.get('email')
        if not target_price or not email:
            return Response({'error': 'target_price and email required'}, status=400)
        alert = PriceAlert.objects.create(
            product=product,
            target_price=Decimal(str(target_price)),
            email=email
        )
        serializer = PriceAlertSerializer(alert)
        return Response(serializer.data, status=201)

@api_view(['DELETE'])
def delete_alert(request, alert_id):
    try:
        alert = PriceAlert.objects.get(id=alert_id)
        alert.delete()
        return Response({'message': 'Alert deleted'})
    except PriceAlert.DoesNotExist:
        return Response({'error': 'Alert not found'}, status=404)

@api_view(['GET'])
def price_history(request, asin):
    try:
        product = TrackedProduct.objects.get(asin=asin)
        history = product.price_history.all()[:30]
        data = [{'price': float(h.price), 'date': h.recorded_at.isoformat()} for h in history]
        return Response({'asin': asin, 'history': data})
    except TrackedProduct.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
def all_alerts(request):
    alerts = PriceAlert.objects.select_related('product').filter(is_active=True).order_by('-created_at')
    data = []
    for alert in alerts:
        data.append({
            'id': alert.id,
            'asin': alert.product.asin,
            'title': alert.product.title,
            'image_url': alert.product.image_url,
            'current_price': float(alert.product.current_price) if alert.product.current_price else None,
            'target_price': float(alert.target_price),
            'email': alert.email,
            'triggered': alert.triggered,
            'created_at': alert.created_at.isoformat(),
        })
    return Response(data)