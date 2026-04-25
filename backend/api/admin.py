from django.contrib import admin
from .models import TrackedProduct, PriceHistory, PriceAlert

@admin.register(TrackedProduct)
class TrackedProductAdmin(admin.ModelAdmin):
    list_display = ['asin', 'title', 'current_price', 'updated_at']
    search_fields = ['asin', 'title']

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ['product', 'price', 'recorded_at']
    list_filter = ['product']

@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    list_display = ['product', 'target_price', 'email', 'is_active', 'triggered']
    list_filter = ['is_active', 'triggered']
