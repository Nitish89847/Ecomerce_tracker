from rest_framework import serializers
from .models import TrackedProduct, PriceHistory, PriceAlert

class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = ['id', 'price', 'recorded_at']

class PriceAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceAlert
        fields = ['id', 'target_price', 'email', 'is_active', 'triggered', 'created_at']

class TrackedProductSerializer(serializers.ModelSerializer):
    price_history = PriceHistorySerializer(many=True, read_only=True)
    alerts = PriceAlertSerializer(many=True, read_only=True)

    class Meta:
        model = TrackedProduct
        fields = ['id', 'asin', 'title', 'image_url', 'current_price', 'original_price', 
                  'product_url', 'currency', 'created_at', 'updated_at', 'price_history', 'alerts']
