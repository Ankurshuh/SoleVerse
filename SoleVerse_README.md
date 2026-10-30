# 👟 SoleVerse — 3D Shoe E-Commerce

A full-stack shoe e-commerce platform with **interactive 3D shoe models**, built with **FastAPI** (backend) and **React + Three.js** (frontend).

---

## 🗂️ Project Structure

```
shoe-store/
├── backend/
│   ├── main.py              ← FastAPI server
│   └── requirements.txt
└── SoleVerse_ECommerce.jsx  ← React + Three.js frontend
```

---

## 🚀 Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be live at: **http://localhost:8000**  
Swagger docs at: **http://localhost:8000/docs**

---

### 2. Frontend (React)

**Option A — Claude.ai Artifact** *(instant preview)*
> Paste `SoleVerse_ECommerce.jsx` directly into Claude's artifact viewer.

**Option B — Vite React App**
```bash
npm create vite@latest shoe-frontend -- --template react
cd shoe-frontend
npm install three
# Replace src/App.jsx with SoleVerse_ECommerce.jsx
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| GET    | `/products`                  | List all products        |
| GET    | `/products?category=Running` | Filter by category       |
| GET    | `/products?search=nike`      | Search products          |
| GET    | `/products/{id}`             | Single product           |
| GET    | `/products/{id}/related`     | Related products         |
| GET    | `/categories`                | All categories           |
| POST   | `/orders`                    | Place an order           |

### Order Payload Example
```json
{
  "items": [{ "product_id": "1", "size": 10, "color": "#FF3A3A", "quantity": 1 }],
  "total": 189.99,
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

---

## ✨ Features

### 🎮 3D Shoe Models
- **Procedural Three.js geometry** — no external 3D files needed
- Real-time color customization (shoe color updates instantly in 3D)
- Auto-rotate animation with hover control
- Dynamic point lighting matching selected color

### 🛍️ E-Commerce
- Product grid with 3D previews on hover
- **Product detail modal** with full 3D viewer
- Color + size selector with live 3D update
- Quantity picker
- Persistent cart sidebar with mini 3D previews
- Checkout flow with order confirmation

### 🎨 Design
- Dark luxury theme with neon cyan accents
- Animated hero with floating 3D shoe
- CSS grid background animation
- Smooth card hover effects (lift + glow)
- Mobile-responsive grid

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python · FastAPI · Uvicorn · Pydantic |
| Frontend  | React 18 · Three.js r128 · CSS      |
| 3D Engine | WebGL via Three.js (procedural)     |
| Fonts     | Playfair Display · Space Mono       |

---

## 📦 Products Included

| Shoe              | Brand   | Category     | Price  |
|-------------------|---------|--------------|--------|
| AirEdge Pro X     | NIKE    | Running      | $189   |
| Velocity Storm    | ADIDAS  | Training     | $159   |
| CloudWalk Elite   | ON      | Lifestyle    | $219   |
| NightRacer Neon   | PUMA    | Running      | $129   |
| UrbanGrip Low     | VANS    | Skateboarding| $89    |
| TerraForce GTX    | SALOMON | Trail        | $249   |

---

## 🔮 Extending

- **Add real 3D models**: Replace `ShoeModel3D` with GLTFLoader from Three.js
- **Database**: Swap in-memory dict for PostgreSQL + SQLAlchemy
- **Auth**: Add JWT tokens with `python-jose`
- **Payments**: Integrate Stripe with `/payment-intent` endpoint
