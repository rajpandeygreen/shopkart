/* ============================================================
   Shared: header, footer, cart, auth, API sync, UI helpers
   All text in simple Indian English.
   ============================================================ */

/* ---------- TINY DOM HELPERS ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const getProduct = id => PRODUCTS.find(p => p.id === id);
/* getSeller() comes from data.js */
const inr = n => "₹" + Number(n).toLocaleString("en-IN");
const discount = p => Math.round((p.mrp - p.price) / p.mrp * 100);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stars = n => "★★★★★".slice(0, Math.round(n)) + "☆☆☆☆☆".slice(0, 5 - Math.round(n));
const sellerOf = p => getSeller(p.seller) || SELLERS[0];
const stockLabel = p => p.stock > 20 ? "In Stock" : p.stock > 0 ? `Only ${p.stock} left` : "Out of Stock";

/* ---------- IMAGES ---------- */
function imgSrc(p, w = 500) {
  if (!p.img) return "";
  return `${p.img}?auto=format&fit=crop&w=${w}&q=75`;
}
function imgTag(p, w = 500, cls = "pimg-img") {
  if (!p.img) return "";
  return `<img class="${cls}" src="${imgSrc(p, w)}" alt="${esc(p.title)}" loading="lazy"
            onerror="this.style.display='none'">`;
}

/* ---------- API CLIENT ---------- */
const API = {
  online: false,
  token() { return localStorage.getItem("shopkart_token") || ""; },
  async init() {
    if (location.protocol === "file:") { this.online = false; return; }
    try {
      const r = await fetch("/api/health");
      this.online = r.ok;
    } catch { this.online = false; }
    if (!this.online) console.info("ShopKart: server not running — demo mode (browser storage).");
  },
  async req(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    if (this.token()) headers.Authorization = "Bearer " + this.token();
    const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) throw new Error(data.error || "Server error (" + res.status + ")");
    return data;
  }
};

/* ---------- AUTH ---------- */
/* The server sends `role` and `sellerId`. Turn those into handy flags
   (isAdmin / isSeller) so every page can check them the same way. */
function normalizeUser(u) {
  if (!u) return null;
  const role = u.role || "customer";
  return Object.assign({}, u, {
    role,
    isAdmin: role === "admin",
    isSeller: role === "seller" && !!u.sellerId,
  });
}

const Auth = {
  KEY: "shopkart_user",
  user() {
    try { return normalizeUser(JSON.parse(localStorage.getItem(this.KEY) || "null")); } catch { return null; }
  },
  isLoggedIn() { return !!this.user(); },
  setSession(token, user) {
    localStorage.setItem("shopkart_token", token || "");
    localStorage.setItem(this.KEY, JSON.stringify(normalizeUser(user)));
    renderHeader();
    Store.pull();
  },
  clearSession() {
    localStorage.removeItem("shopkart_token");
    localStorage.removeItem(this.KEY);
    renderHeader();
  },
  demoUsers() {
    try { return JSON.parse(localStorage.getItem("shopkart_demo_users") || "[]"); } catch { return []; }
  },
  async login(email, password) {
    email = String(email || "").trim().toLowerCase();
    if (API.online) {
      const d = await API.req("POST", "/api/login", { email, password });
      this.setSession(d.token, d.user);
      return d.user;
    }
    const u = this.demoUsers().find(x => x.email === email);
    if (!u) throw new Error("Account not found. Please sign up first.");
    if (u.pass !== btoa(encodeURIComponent(password))) throw new Error("Wrong password. Please try again.");
    this.setSession("demo_" + u.id, { id: u.id, name: u.name, email: u.email });
    return u;
  },
  async register(name, email, password) {
    email = String(email || "").trim().toLowerCase();
    name = String(name || "").trim();
    if (API.online) {
      const d = await API.req("POST", "/api/register", { name, email, password });
      this.setSession(d.token, d.user);
      return d.user;
    }
    const users = this.demoUsers();
    if (users.some(x => x.email === email)) throw new Error("This email is already registered. Please log in.");
    const u = { id: "u" + Date.now(), name, email, pass: btoa(encodeURIComponent(password)) };
    users.push(u);
    localStorage.setItem("shopkart_demo_users", JSON.stringify(users));
    this.setSession("demo_" + u.id, { id: u.id, name: u.name, email: u.email });
    return u;
  },
  async logout() {
    if (API.online && API.token()) { try { await API.req("POST", "/api/logout"); } catch {} }
    this.clearSession();
    toast("You have logged out");
    const page = location.pathname.split("/").pop();
    const guarded = ["account.html", "orders.html", "admin.html", "seller.html"];
    setTimeout(() => {
      if (guarded.includes(page)) location.href = "login.html";
      else location.reload();
    }, 500);
  },
  require(next) {
    if (this.isLoggedIn()) return true;
    location.href = "login.html?next=" + encodeURIComponent(next || location.pathname.split("/").pop() || "index.html");
    return false;
  }
};

/* ---------- CART / WISHLIST ---------- */
const Store = {
  cartKey: "shopkart_cart",
  wishKey: "shopkart_wish",
  orderKey: "shopkart_orders",
  _busy: false,

  cart() { try { return JSON.parse(localStorage.getItem(this.cartKey)) || []; } catch { return []; } },
  saveCart(c) { localStorage.setItem(this.cartKey, JSON.stringify(c)); updateCartBadge(); this.push(); },
  wish() { try { return JSON.parse(localStorage.getItem(this.wishKey)) || []; } catch { return []; } },
  saveWish(w) { localStorage.setItem(this.wishKey, JSON.stringify(w)); },

  addToCart(id, qty = 1) {
    const p = getProduct(id);
    if (p && p.stock === 0) { toast("Sorry, this item is out of stock"); return; }
    if (p && p.stock < qty) { toast(`Only ${p.stock} piece(s) available`); return; }
    const c = this.cart();
    const line = c.find(x => x.id === id);
    if (line) line.qty = Math.min(line.qty + qty, 10);
    else c.push({ id, qty });
    this.saveCart(c);
  },
  setQty(id, qty) {
    const c = this.cart();
    const line = c.find(x => x.id === id);
    if (line) line.qty = qty;
    this.saveCart(c.filter(x => x.qty > 0));
  },
  removeFromCart(id) { this.saveCart(this.cart().filter(x => x.id !== id)); },
  clearCart() { this.saveCart([]); },

  toggleWish(id) {
    let w = this.wish();
    if (w.includes(id)) w = w.filter(x => x !== id); else w.push(id);
    this.saveWish(w);
    return w.includes(id);
  },

  /* ---- server sync (login + server required) ---- */
  async push() {
    if (this._busy || !API.online || !Auth.isLoggedIn()) return;
    this._busy = true;
    try { await API.req("PUT", "/api/cart", { cart: this.cart() }); }
    catch (e) { console.warn("cart sync:", e.message); }
    finally { this._busy = false; }
  },
  async pull() {
    if (!API.online || !Auth.isLoggedIn()) return;
    try {
      const d = await API.req("GET", "/api/cart");
      const server = (d.cart || []).filter(l => getProduct(l.id));
      const local = this.cart();
      local.forEach(l => {
        const s = server.find(x => x.id === l.id);
        if (s) s.qty = Math.max(s.qty, l.qty); else server.push(l);
      });
      this._busy = true;
      localStorage.setItem(this.cartKey, JSON.stringify(server.slice(0, 30)));
      updateCartBadge();
      this._busy = false;
      document.dispatchEvent(new CustomEvent("cart:synced"));
    } catch (e) { console.warn("cart pull:", e.message); this._busy = false; }
  },

  addOrderLocal(order) {
    const o = JSON.parse(localStorage.getItem(this.orderKey) || "[]");
    o.unshift(order);
    localStorage.setItem(this.orderKey, JSON.stringify(o.slice(0, 20)));
  },
  ordersLocal() { try { return JSON.parse(localStorage.getItem(this.orderKey)) || []; } catch { return []; } },
  async placeOrderOnServer(order) {
    if (!API.online || !Auth.isLoggedIn()) return null;
    try { return await API.req("POST", "/api/orders", order); }
    catch (e) { console.warn("order sync:", e.message); return null; }
  },
  async orders() {
    if (API.online && Auth.isLoggedIn()) {
      try {
        const d = await API.req("GET", "/api/orders");
        if (Array.isArray(d.orders) && d.orders.length) return d.orders;
      } catch (e) { console.warn("orders:", e.message); }
    }
    return this.ordersLocal();
  }
};

const cartCount = () => Store.cart().reduce((s, l) => s + l.qty, 0);

function updateCartBadge() {
  const b = $("#cartCount");
  if (!b) return;
  const n = cartCount();
  b.textContent = n;
  b.style.display = n ? "flex" : "none";
}

/* ---------- TOAST ---------- */
function toast(msg, actionLabel, action) {
  $$(".toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span>✓</span><span>${esc(msg)}</span>`;
  if (actionLabel) {
    const a = document.createElement("span");
    a.className = "u"; a.textContent = actionLabel;
    a.onclick = () => { action && action(); t.remove(); };
    t.appendChild(a);
  }
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2800);
}

/* ---------- PAYMENT: CASH ON DELIVERY ---------- */
const COD = {
  KEY: "shopkart_cod",
  LIMIT: 50000,      // COD allowed up to ₹50,000
  FEE: 20,           // small handling fee
  FREE_ABOVE: 20000, // free handling above ₹20,000
  enabled() { return localStorage.getItem(this.KEY) !== "0"; },
  set(on) { localStorage.setItem(this.KEY, on ? "1" : "0"); },
  feeFor(amount) { return amount >= this.FREE_ABOVE ? 0 : this.FEE; },
  available(amount) { return this.enabled() && amount <= this.LIMIT; },
};

/* Payment method + delivery address kept for checkout */
const Checkout = {
  KEY: "shopkart_checkout",
  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {
        method: "cod", name: "", phone: "", pincode: "", address: "", city: "", state: "",
      };
    } catch {
      return { method: "cod", name: "", phone: "", pincode: "", address: "", city: "", state: "" };
    }
  },
  save(v) { localStorage.setItem(this.KEY, JSON.stringify(v)); },
};

/* ---------- CHECKOUT GATE ---------- */
function goCheckout() {
  if (!Store.cart().length) { toast("Your cart is empty"); return; }
  if (!Auth.require("cart.html?checkout=1")) return;
  location.href = "cart.html?checkout=1";
}

/* ---------- PRODUCT CARD ---------- */
function productCard(p, opts = {}) {
  const wished = Store.wish().includes(p.id);
  const tag = p.tags?.[0];
  const tagText = { deal: "Deal of the Day", trending: "Trending", new: "Just Launched", bestseller: "Bestseller" }[tag] || "";
  return `
  <div class="pcard" data-id="${p.id}" onclick="location.href='product.html?id=${p.id}'">
    <div class="pimg" style="background:${p.grad}">
      <span class="fallback">${p.emoji}</span>
      ${imgTag(p, 500)}
      ${tagText ? `<span class="tag-chip">${tagText}</span>` : ""}
      <button class="wish ${wished ? "on" : ""}" title="Wishlist"
        onclick="event.stopPropagation();toggleWish('${p.id}',this)">${wished ? "❤️" : "♡"}</button>
    </div>
    <div class="pname">${esc(p.title)}</div>
    <div class="rating-row">
      <span class="rating-badge">${p.rating} ★</span>
      <span class="rating-count">(${p.ratings.toLocaleString("en-IN")})</span>
      ${p.assured ? '<span class="assured">✓ Assured</span>' : ""}
    </div>
    <div class="seller-line">Sold by <b>${esc(sellerOf(p).name)}</b></div>
    <div class="price-row">
      <span class="price">${inr(p.price)}</span>
      <span class="mrp">${inr(p.mrp)}</span>
      <span class="off">${discount(p)}% off</span>
    </div>
    <div class="free-ship">${p.delivery === "Today" ? "🚚 Free Delivery Today" : "🚚 Free Delivery"}</div>
    ${opts.showAdd !== false ? `<button class="quick-add" onclick="event.stopPropagation();quickAdd('${p.id}')">Add to Cart</button>` : ""}
  </div>`;
}

function quickAdd(id) {
  Store.addToCart(id);
  if (Store.cart().some(l => l.id === id)) {
    toast("Added to cart", "Go to Cart", () => location.href = "cart.html");
  }
}

function toggleWish(id, btn) {
  const on = Store.toggleWish(id);
  if (btn) { btn.textContent = on ? "❤️" : "♡"; btn.classList.toggle("on", on); }
  toast(on ? "Added to wishlist" : "Removed from wishlist");
}

/* ---------- HEADER & FOOTER ---------- */
function renderHeader() {
  const nav = $(".nav-links");
  if (!nav) return;
  nav.innerHTML = `
    <a href="cart.html" title="Cart" class="cart-link">
      🛒<span class="cart-badge" id="cartCount" style="display:none">0</span>
      <span class="hide-sm">Cart</span>
    </a>
    <a href="wishlist.html" title="Wishlist" class="wish-link">❤️</a>
    <div class="user-menu" id="userMenu"></div>`;
  renderAccountMenu();
  updateCartBadge();
}

function renderAccountMenu() {
  const box = $("#userMenu");
  if (!box) return;
  const u = Auth.user();
  if (!u) {
    box.innerHTML = `<a class="btn-login hide-sm" href="login.html">Login</a>`;
    return;
  }
  const isAdmin = !!u.isAdmin;
  const sellerId = u.sellerId;
  box.innerHTML = `
    <button class="user-btn" onclick="event.stopPropagation();toggleUserMenu()">
      <span class="avatar">${esc(u.name.trim()[0].toUpperCase())}</span>
      <span class="uname hide-sm">${esc(u.name.split(" ")[0])}</span> ▾
    </button>
    <div class="user-drop">
      <div class="ud-head"><b>${esc(u.name)}</b><span>${esc(u.email)}</span></div>
      ${isAdmin ? `<a href="admin.html">🛡️ Admin Panel</a>` : ""}
      ${sellerId ? `<a href="seller.html">🏪 Seller Panel</a>` : ""}
      <a href="account.html">👤 My Profile</a>
      <a href="orders.html">📦 My Orders</a>
      <a href="wishlist.html">❤️ My Wishlist</a>
      <a href="seller.html">🤝 Seller Partner</a>
      <button onclick="Auth.logout()">↩️ Logout</button>
    </div>`;
}

function toggleUserMenu() {
  const m = $("#userMenu");
  if (m) m.classList.toggle("open");
}
document.addEventListener("click", () => {
  const m = $("#userMenu");
  if (m) m.classList.remove("open");
});

function renderFooter() {
  const f = $("#siteFooter");
  if (!f) return;
  f.innerHTML = `
  <div class="fcols">
    <div class="fcol">
      <h4>ABOUT</h4>
      <a href="#" onclick="return false">Contact Us</a>
      <a href="#" onclick="return false">About Us</a>
      <a href="#" onclick="return false">Careers</a>
      <a href="#" onclick="return false">Our Stories</a>
      <a href="#" onclick="return false">Press</a>
    </div>
    <div class="fcol">
      <h4>SELL ON SHOPKART</h4>
      <a href="seller.html">Become a Seller</a>
      <a href="seller.html#login">Seller Login</a>
      <a href="seller.html#plans">Seller Plans</a>
      <a href="admin.html">Admin Login</a>
    </div>
    <div class="fcol">
      <h4>HELP</h4>
      <a href="orders.html">Track Order</a>
      <a href="#" onclick="return false">Payments</a>
      <a href="#" onclick="return false">Shipping</a>
      <a href="#" onclick="return false">Cancellation &amp; Returns</a>
      <a href="#" onclick="return false">FAQ</a>
    </div>
    <div class="fcol">
      <h4>POLICY</h4>
      <a href="#" onclick="return false">Return Policy</a>
      <a href="#" onclick="return false">Terms of Use</a>
      <a href="#" onclick="return false">Security</a>
      <a href="#" onclick="return false">Privacy</a>
    </div>
  </div>
  <div class="fbar">
    <div class="who">
      <div><span class="lbl">Mail Us:</span><span class="val">✉️ support@shopkart.com</span></div>
      <div><span class="lbl">Registered Office:</span><span class="val">📍 Bengaluru, Karnataka 560103</span></div>
    </div>
    <div class="pay">
      <span>© 2026 ShopKart.com</span>
      <span>💵 Cash on Delivery</span>
      <span>📱 UPI</span>
      <span>💳 Cards</span>
    </div>
  </div>`;
}

/* ---------- GLOBAL INIT ---------- */
function goSearch(v) {
  v = (v || "").trim();
  location.href = v ? `index.html?q=${encodeURIComponent(v)}` : "index.html";
}

function initHeader() {
  renderHeader();
  renderFooter();
  const q = new URLSearchParams(location.search).get("q");
  const inp = $("#searchInput");
  if (inp && q) inp.value = q;
  const form = $("#searchForm");
  if (form) form.onsubmit = e => {
    e.preventDefault();
    goSearch(inp.value);
  };
  initSearchSuggest(inp);
  const bt = $("#backTop");
  if (bt) {
    window.addEventListener("scroll", () => bt.style.display = window.scrollY > 400 ? "flex" : "none");
    bt.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }
  API.init().then(async () => {
    if (Auth.isLoggedIn()) {
      const me = await API.req("GET", "/api/me").catch(() => null);
      if (me && me.user) {
        localStorage.setItem("shopkart_user", JSON.stringify(normalizeUser(me.user)));
        renderAccountMenu();
      }
      Store.pull();
    }
  });
}

/* ---------- LIVE SEARCH SUGGESTIONS ---------- */
/* Shows matching categories, brands and products while typing.
   Works with every Indian language (see search.js).            */
function initSearchSuggest(inp) {
  const box = $("#suggestBox");
  if (!inp || !box || typeof SmartSearch === "undefined") return;

  let items = [];
  let active = -1;

  const close = () => { box.classList.remove("open"); box.innerHTML = ""; items = []; active = -1; };

  const open = () => {
    const products = (typeof PRODUCTS !== "undefined" ? PRODUCTS : []);
    const cats = (typeof CATEGORIES !== "undefined" ? CATEGORIES : []);
    items = SmartSearch.searchSuggest(inp.value, products, cats, 8);
    if (!items.length) return close();
    box.innerHTML = items.map((it, i) => suggestRow(it, i)).join("");
    box.classList.add("open");
    active = -1;
  };

  const pick = i => {
    const it = items[i];
    if (!it) return;
    if (it.type === "product" && it.id) location.href = `product.html?id=${encodeURIComponent(it.id)}`;
    else if (it.type === "category" && it.cat) location.href = `index.html?q=${encodeURIComponent(it.cat)}`;
    else goSearch(it.label);
  };

  box.addEventListener("mousedown", e => {
    const row = e.target.closest(".sug-item");
    if (row) { e.preventDefault(); pick(Number(row.dataset.i)); }
  });

  inp.addEventListener("input", open);
  inp.addEventListener("focus", () => { if (inp.value.trim()) open(); });
  inp.addEventListener("keydown", e => {
    if (!box.classList.contains("open")) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      active = e.key === "ArrowDown"
        ? (active + 1) % items.length
        : (active - 1 + items.length) % items.length;
      [...box.querySelectorAll(".sug-item")].forEach((el, i) =>
        el.classList.toggle("active", i === active));
      box.querySelectorAll(".sug-item")[active]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      if (active >= 0) { e.preventDefault(); pick(active); }
    } else if (e.key === "Escape") {
      close();
    }
  });
  document.addEventListener("click", e => { if (!e.target.closest("#searchForm")) close(); });
}

function suggestRow(it, i) {
  const thumb = it.img
    ? `<img class="sug-ico" src="${it.img}" alt="" loading="lazy">`
    : `<span class="sug-ico emoji">${it.emoji || "📦"}</span>`;
  const hint = it.type === "category" ? "" : (it.sub || "");
  return `<div class="sug-item" data-i="${i}" role="option">
      ${thumb}
      <div class="sug-txt">
        <div class="sug-label">${esc(it.label)}</div>
        ${hint ? `<div class="sug-sub">${esc(hint)}</div>` : ""}
      </div>
      ${it.type === "product" ? '<span class="sug-go">→</span>' : ""}
    </div>`;
}

/* ---------- DEAL TIMER ---------- */
function startDealTimer(el) {
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    const s = Math.max(0, Math.floor((end - now) / 1000));
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    el.innerHTML = `<span>⏳ Sale ends in</span><b>${h}</b>:<b>${m}</b>:<b>${sec}</b>`;
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- SHARED ORDER HELPERS ---------- */
function orderItemCount(o) {
  if (Array.isArray(o.items)) return o.items.reduce((s, i) => s + (i.qty || 1), 0);
  return Number(o.items) || 0;
}
function orderDate(o) {
  const d = new Date(o.date);
  return isNaN(d) ? String(o.date || "") : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function statusPill(status) {
  const color = STATUS_STYLE[status] || "#1a5fd0";
  return `<span class="status-pill" style="background:${color}1a;color:${color}">● ${esc(status || "Confirmed")}</span>`;
}
function paymentLabel(method) {
  return method === "cod" ? "Cash on Delivery" : "Paid Online";
}

document.addEventListener("DOMContentLoaded", initHeader);
