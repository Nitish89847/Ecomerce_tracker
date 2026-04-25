import requests
from django.conf import settings

BASE_URL = "https://real-time-amazon-data.p.rapidapi.com"

HEADERS = {
    "x-rapidapi-key": settings.RAPIDAPI_KEY,
    "x-rapidapi-host": settings.RAPIDAPI_HOST,
}

def search_products(query, page=1, country="US"):
    url = f"{BASE_URL}/search"
    params = {
        "query": query,
        "page": str(page),
        "country": country,
        "sort_by": "RELEVANCE",
        "product_condition": "ALL",
    }
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        products = []
        for item in data.get("data", {}).get("products", []):
            products.append({
                "asin": item.get("asin", ""),
                "title": item.get("product_title", ""),
                "image_url": item.get("product_photo", ""),
                "current_price": item.get("product_price", ""),
                "original_price": item.get("product_original_price", ""),
                "rating": item.get("product_star_rating", ""),
                "reviews": item.get("product_num_ratings", 0),
                "product_url": item.get("product_url", ""),
                "is_prime": item.get("is_prime", False),
                "discount": item.get("discount", ""),
            })
        return {"success": True, "products": products, "total": len(products)}
    except Exception as e:
        return {"success": False, "error": str(e), "products": []}

def get_product_details(asin, country="US"):
    url = f"{BASE_URL}/product-details"
    params = {"asin": asin, "country": country}
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        product_data = data.get("data", {})
        return {
            "success": True,
            "asin": asin,
            "title": product_data.get("product_title", ""),
            "image_url": product_data.get("product_photo", ""),
            "current_price": product_data.get("product_price", ""),
            "original_price": product_data.get("product_original_price", ""),
            "rating": product_data.get("product_star_rating", ""),
            "reviews": product_data.get("product_num_ratings", 0),
            "product_url": product_data.get("product_url", ""),
            "about": product_data.get("about_product", []),
            "features": product_data.get("product_information", {}),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_product_offers(asin, country="US"):
    url = f"{BASE_URL}/product-offers"
    params = {"asin": asin, "country": country}
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return {"success": True, "offers": data.get("data", {}).get("offers", [])}
    except Exception as e:
        return {"success": False, "error": str(e), "offers": []}
