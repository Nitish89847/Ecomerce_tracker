from django.db import models

class TrackedProduct(models.Model):
    asin = models.CharField(max_length=20, unique=True)
    title = models.TextField()
    image_url = models.URLField(max_length=500, blank=True)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    product_url = models.URLField(max_length=500, blank=True)
    currency = models.CharField(max_length=5, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title[:50]} - {self.asin}"

class PriceHistory(models.Model):
    product = models.ForeignKey(TrackedProduct, on_delete=models.CASCADE, related_name='price_history')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

class PriceAlert(models.Model):
    product = models.ForeignKey(TrackedProduct, on_delete=models.CASCADE, related_name='alerts')
    target_price = models.DecimalField(max_digits=10, decimal_places=2)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)
    triggered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alert for {self.product.asin} at ${self.target_price}"
