import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI(title="PriceHub Global Live Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/app")
def serve_app():
    return FileResponse("index.html")

@app.get("/search")
def search_live(query: str = "watch", country: str = "PK"):
    results = []
    try:
        word = query.split()[-1] if query.strip() else "watch"
        r = requests.get(f"https://dummyjson.com{word}", timeout=6).json()
        for item in r.get("products", [])[:4]:
            usd = item.get("price", 45)
            price_str = f"Rs. {int(usd * 278):,}" if country.upper() == "PK" else f"${usd}"
            results.append({
                "store": f"{item.get('brand') or 'Official Store'} - {item.get('title', query)}",
                "price": price_str,
                "delivery": "2-4 Days",
                "url": f"https://amazon.com{query}"
            })
    except Exception:
        pass

    c = country.upper()
    results.extend([
        {"store": f"Daraz Pakistan ({query})", "price": "Rs. 4,250" if c=="PK" else "$15.30", "delivery": "2-4 Days", "url": f"https://daraz.pk{query}"},
        {"store": f"AliExpress ({query})", "price": "Rs. 3,100" if c=="PK" else "$11.20", "delivery": "10-18 Days", "url": f"https://aliexpress.com{query}"},
        {"store": f"Amazon Global ({query})", "price": "Rs. 6,900" if c=="PK" else "$24.99", "delivery": "1-3 Days", "url": f"https://amazon.com{query}"},
        {"store": f"Alibaba Wholesale ({query})", "price": "Rs. 2,150" if c=="PK" else "$7.80", "delivery": "7-15 Days", "url": f"https://alibaba.com{query}"},
        {"store": f"Noon UAE ({query})", "price": "AED 89" if c=="AE" else "$24.20", "delivery": "Same Day", "url": f"https://noon.com{query}"}
    ])
    return {"placeholder": "Search any product...", "buy_text": "Open Store", "results": results}
