from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_products, name='search'),
    path('product/<str:asin>/', views.product_details, name='product-details'),
    path('product/<str:asin>/offers/', views.product_offers, name='product-offers'),
    path('product/<str:asin>/history/', views.price_history, name='price-history'),
    path('product/<str:asin>/alerts/', views.product_alerts, name='product-alerts'),
    path('product/<str:asin>/refresh/', views.refresh_product, name='refresh-product'),
    path('tracked/', views.tracked_products, name='tracked-products'),
    path('track/', views.track_product, name='track-product'),
    path('untrack/<str:asin>/', views.untrack_product, name='untrack-product'),
    path('alerts/', views.all_alerts, name='all-alerts'),
    path('alerts/<int:alert_id>/delete/', views.delete_alert, name='delete-alert'),
]
