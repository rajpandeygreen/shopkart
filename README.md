# 🛒 ShopKart — Flipkart-style Ecommerce Website

A complete ecommerce website with **real product photos**, **login/signup**, **cart**, **wishlist**, **orders**, an **admin panel**, a **seller partner section**, **Cash on Delivery**, and a **Node.js backend** that saves data in `db.json`. No npm packages are needed.

---

## 🚀 How to run

### Option 1 — Full app (backend + database) ✅ recommended

```bash
cd "Default Project"
node server.js
```

Then open your browser at: **http://localhost:3000**

Demo logins:

```
Customer:  demo@shopkart.com    / demo123
Admin:     admin@shopkart.com   / admin123
Seller 1:  seller@shopkart.com  / seller123   (SuperComNet)
Seller 2:  partner@shopkart.com / seller123   (partner store)
```

> This project ships with a portable Node.js v24 in `.node/`. If Node is not installed on your PC, run `.\.node\node.exe server.js` instead.

### Option 2 — Frontend only (without Node.js)

Double-click `index.html`. Everything works, but data stays in **localStorage** (demo mode). Login is also local, and the login page auto-creates a demo account (`demo@shopkart.com` / `demo123`). Admin and Seller panels need the running server.

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🏠 Home page | Category strip, hero banner, Deals of the Day (daily timer), Top Picks, Bestsellers, Just Launched |
| 🔍 Smart search | Header search with **live suggestions** while you type, plus sorting (popularity, price, discount, rating) |
| 🌐 Multi-language search | Search in **any Indian language** — Hindi, Tamil, Bengali, Telugu, Marathi, Kannada, Malayalam, Gujarati, Punjabi, Odia, Urdu. Type `मोबाइल`, `மொபைல்`, `ফোন`, `మొబైల్` or `சாம்சங்` and the right products appear |
| 📦 28 products | Mobiles, fashion, electronics, home, appliances, beauty, grocery, travel — with real photos |
| 📄 Product page | Gallery, rating breakdown, offers, colour variants, specs, highlights, reviews, similar products |
| 🛒 Cart | Add/remove, qty +/−, coupons (`SHOP10`, `FLAT500`, `NEW20`), price breakdown, "You save" |
| ❤️ Wishlist | Save/unsave, dedicated page, move to cart |
| 👤 Auth | Signup + Login (passwords hashed on the server with scrypt; offline demo mode also works) |
| 📦 Orders | Order placement, order ID, My Orders page, tracking, cancel, invoice, "Buy Again" |
| 💵 Cash on Delivery | COD at checkout with a ₹20 handling fee (free above ₹20,000), max order value ₹50,000. Admin can turn COD on/off |
| 🛡️ Admin panel | Dashboard KPIs, all orders + status control, edit any product, sellers, seller requests, customers, COD setting |
| 🏪 Seller panel | Seller dashboard, their own products (edit price + stock), their own orders, advance order status (Packed → Shipped → Out for Delivery → Delivered), payouts |
| 🤝 Become a Seller | Seller application form → admin approves → new seller account is created |
| 🔄 Sync | When logged in, the cart syncs with the server (safe across devices) |
| 📱 Responsive | 2-column grid on mobile + sticky bottom Add to Cart bar |

---

## 🌐 How multi-language search works

Every Indian-language word is translated to its English shopping term before matching. The dictionary lives in `search.js` and runs fully offline.

Examples that find the right products:

| You type | Meaning | What you get |
|---|---|---|
| `मोबाइल`, `फोन`, `மொபைல்`, `মোবাইল`, `మొబైల్`, `ಮೊಬೈಲ್` | mobile / phone | Mobiles category |
| `लैपटॉप`, `லैपடாப்`, `ಲ್ಯಾಪ್ಟಾಪ್` | laptop | Electronics (laptops) |
| `शर्ट`, `குர்தா`, `ଶାର୍ଟ` | shirt / kurta | Fashion |
| `जूते`, `चप्पल`, `செருப்பு` | shoes | Fashion |
| `चावल`, `আরিসি`, `அரிசி`, `బియ్యం` | rice | Grocery |
| `आटा`, `ময়দা` | flour / atta | Grocery |
| `फ्रिज`, `मिक्सी`, `এসি` | fridge / mixer / AC | Appliances |
| `आईफोन`, `சாம்சங்`, `স্যামসাং`, `शाओमी` | brand names | The matching brand products |
| `lal shart`, `लाल शर्ट` | red shirt | Fashion (colour behaves as a soft filter) |

Live suggestions show matching **categories**, **brands** and **products** in a dropdown as you type. Use the ↑/↓ arrow keys and Enter to pick one, or click it with the mouse.

---

## 📁 Files

```
index.html      → home + search results
product.html    → product detail
cart.html       → cart, coupons, order placement (online / COD)
wishlist.html   → saved items
login.html      → login / signup
account.html    → profile + my orders
orders.html     → order tracking, cancel, invoice
admin.html      → admin panel
seller.html     → become a seller + seller dashboard
style.css       → Flipkart-style theme (responsive)
data.js         → products, categories, coupons, sellers, reviews (single source of truth)
search.js       → multi-language dictionary + live search suggestions
app.js          → cart, auth, API client, UI helpers
server.js       → Node.js backend (zero dependencies)
db.json         → auto-created database (users, sessions, carts, orders)
```

---

## 🔌 API endpoints

| Method | Route | What it does |
|---|---|---|
| GET | `/api/health` | Server status |
| GET | `/api/products?q=` | Products list / search |
| POST | `/api/register` | `{name,email,password}` → token |
| POST | `/api/login` | `{email,password}` → token |
| GET | `/api/me` | Current user (Bearer token) |
| POST | `/api/logout` | Delete session |
| GET | `/api/cart` | The user's cart |
| PUT | `/api/cart` | `{cart:[{id,qty}]}` save cart |
| GET | `/api/orders` | The user's orders |
| POST | `/api/orders` | Place an order (the total is re-checked on the server) |
| POST | `/api/orders/cancel` | Cancel an order |
| POST | `/api/seller-application` | Apply to become a seller |
| GET | `/api/admin/stats` | Admin dashboard data |
| GET | `/api/admin/orders` | All orders |
| POST | `/api/admin/order-status` | Update an order's status |
| GET | `/api/admin/products` | All products |
| PUT | `/api/admin/product` | Edit any product |
| GET | `/api/admin/customers` | All customers |
| GET | `/api/admin/sellers` | All sellers + pending requests |
| POST | `/api/admin/seller-request` | Approve / reject a seller request |
| GET | `/api/seller/stats` | Seller dashboard data |
| GET | `/api/seller/products` | The seller's own products |
| PUT | `/api/seller/product` | Edit the seller's own product (price + stock) |
| GET | `/api/seller/orders` | Orders that contain the seller's items |
| POST | `/api/seller/order-status` | Advance the seller's order status |

Send the token like this: `Authorization: Bearer <token>`

---

## 💵 Cash on Delivery (COD) rules

- Maximum COD order value: **₹50,000** (above this, online payment is required).
- COD handling fee: **₹20**.
- The fee is **free above ₹20,000**.
- Admin can turn COD **on/off** from Admin Panel → Settings.

---

## 🔐 Roles

| Role | Can do |
|---|---|
| Customer | Shop, cart, wishlist, place and cancel orders, track orders |
| Seller | See own products, edit own price/stock, see own orders, advance order status |
| Admin | Everything: all orders, all products, sellers, customers, COD setting |

Role checks are enforced on the server. A seller calling an admin API gets `403`, and an anonymous user gets `401`.

---

## 🛠️ Notes

- Passwords are hashed with `crypto.scrypt`; session tokens stay valid for 30 days.
- The order total is **recalculated on the server** so prices cannot be tampered with.
- Product photos come from the Unsplash CDN. Without internet, every product falls back to a gradient + emoji.
- Deleting `db.json` resets the database (the demo account is seeded again).
- To change the port: `PORT=4000 node server.js` (Windows PowerShell: `$env:PORT=4000; node server.js`).

---

Made with ❤️ — happy shopping!
