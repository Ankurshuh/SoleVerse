# SoleKraft - Shoe E-Commerce Store

## Project Structure
```
shoe-store/
├── backend/
│   ├── main.py          # FastAPI application
│   └── requirements.txt
└── frontend/
    └── index.html       # Full React app (CDN-based, no build needed)
```

## Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
# API runs on http://localhost:8000
# Docs at http://localhost:8000/docs
```

## Frontend Setup
Just open `frontend/index.html` in a browser.
- By default it uses mock data (works offline)
- To connect to live API: set `USE_API = true` in the script

## API Endpoints
- GET  /products          - List/filter products
- GET  /products/{id}     - Product detail
- GET  /categories        - All categories
- GET  /featured          - Featured products
- POST /orders            - Place order
- GET  /orders            - List orders

## Features
- Product listing with filters (category, price, sort)
- Search functionality
- Product detail page
- Shopping cart (add, remove, update qty)
- Checkout flow with order confirmation
- Responsive design
