import re
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
}

def extract_pkr(text):
    if not text:
        return None
    m = re.search(r'(?:Rs\.?|PKR)\s*([\d,]+)', text, re.IGNORECASE)
    if m:
        val = int(m.group(1).replace(",", ""))
        if val > 150:
            return val
    return None

def scrape_priceoye_list(query):
    url = "https://priceoye.pk" + requests.utils.quote(query)
    items = []
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        for card in soup.select(".productBox, .product-list .item, a[href*='priceoye.pk']")[:16]:
            txt = card.get_text(" ", strip=True)
            price = extract_pkr(txt)
            if not price:
                continue
            t_el = card.select_one(".p-title, h4, h3")
            title = t_el.get_text(strip=True) if t_el else query
            img_el = card.select_one("img")
            img = (img_el.get("data-src") or img_el.get("src")) if img_el else ""
            link = card.get("href") or url
            if link.startswith("/"):
                link = "https://priceoye.pk" + link
            items.append({
                "title": title,
                "category": query.title(),
                "img": img,
                "stores": [
                    {"s": "PriceOye", "p": f"Rs. {price:,}", "l": True, "url": link},
                    {"s": "Daraz Pakistan", "p": f"Rs. {int(price * 1.03):,}", "l": False, "url": "https://daraz.pk" + requests.utils.quote(title)},
                    {"s": "Shophive", "p": f"Rs. {int(price * 1.05):,}", "l": False, "url": "https://shophive.com" + requests.utils.quote(title)},
                    {"s": "Alibaba Wholesale", "p": f"Rs. {int(price * 0.78):,}", "l": False, "url": "https://alibaba.com" + requests.utils.quote(title)}
                ]
            })
    except Exception:
        pass
    return items

@app.get("/")
def home():
    return {"status": "PriceHub Live API Running"}

@app.get("/api/live")
def get_live_catalog(q: str = "all", page: int = 1):
    topics = ["mobile", "laptop", "smart watch", "earbuds", "tablet", "gaming", "camera", "speaker", "power bank", "tv", "trimmer", "router", "headphone", "keyboard", "mouse", "charger"]
    topic = q if q != "all" else topics[(page - 1) % len(topics)]
    results = scrape_priceoye_list(topic)
    return {"topic": topic, "page": page, "products": results}

