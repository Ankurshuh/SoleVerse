from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from typing import List, Optional
import uvicorn

app = FastAPI(title="SoleKraft Shoe Store API", version="1.0.0")


client = MongoClient("mongodb+srv://ankurshukla123:iZyUoUrhWsrgpAHh@cluster0.dt0junk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["products_db"]  # Database name
transactions = db["ankur"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Product(BaseModel):
    id: int
    name: str
    brand: str
    price: float
    original_price: Optional[float] = None
    category: str
    sizes: List[int]
    colors: List[str]
    image: str
    images: List[str]
    description: str
    rating: float
    reviews: int
    badge: Optional[str] = None
    in_stock: bool = True

class CartItem(BaseModel):
    product_id: int
    size: int
    color: str
    quantity: int

class Order(BaseModel):
    items: List[CartItem]
    total: float
    customer_name: str
    email: str
    address: str



@app.get("/")
def root():
    return {"message": "SoleKraft API is running"}

@app.get("/products", response_model=List[Product])
def get_products(category: Optional[str] = None, search: Optional[str] = None,
                 min_price: Optional[float] = None, max_price: Optional[float] = None,
                 sort: Optional[str] = None):
    items = products_db[:]
    if category and category != "All":
        items = [p for p in items if p.category == category]
    if search:
        q = search.lower()
        items = [p for p in items if q in p.name.lower() or q in p.brand.lower() or q in p.category.lower()]
    if min_price is not None:
        items = [p for p in items if p.price >= min_price]
    if max_price is not None:
        items = [p for p in items if p.price <= max_price]
    if sort == "price_asc":
        items.sort(key=lambda x: x.price)
    elif sort == "price_desc":
        items.sort(key=lambda x: x.price, reverse=True)
    elif sort == "rating":
        items.sort(key=lambda x: x.rating, reverse=True)
    elif sort == "reviews":
        items.sort(key=lambda x: x.reviews, reverse=True)
    return items

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for p in products_db:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/categories")
def get_categories():
    cats = list(set(p.category for p in products_db))
    return {"categories": ["All"] + sorted(cats)}

@app.get("/featured", response_model=List[Product])
def get_featured():
    return [p for p in products_db if p.badge in ["Best Seller", "New"]][:4]

@app.post("/orders")
def create_order(order: Order):
    order_id = len(orders_db) + 1
    orders_db.append({"id": order_id, **order.dict()})
    return {"order_id": order_id, "status": "confirmed", "message": "Order placed successfully!"}

@app.get("/orders")
def get_orders():
    return orders_db

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
