// assets/script.js
// Generic helpers for all pages. Uses FOODS from foods.js and localStorage for cart & orders.

const CART_KEY = "canteen_cart_v1";
const ORDERS_KEY = "canteen_orders_v1";

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function clearCart(){
  localStorage.removeItem(CART_KEY);
}
function addToCartById(id, qty = 1){
  const food = FOODS.find(f => f.id === Number(id));
  if(!food) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === food.id);
  if(existing) existing.qty += qty;
  else cart.push({ id: food.id, name: food.name, price: food.price, img: food.img, qty });
  saveCart(cart);
  alert(`${food.name} added to cart`);
  updateCartBadge();
}
function removeFromCart(id){
  let cart = getCart().filter(i => i.id !== Number(id));
  saveCart(cart);
  renderCart(); updateCartBadge();
}
function updateQty(id, qty){
  let cart = getCart();
  const it = cart.find(i => i.id === Number(id));
  if(!it) return;
  it.qty = Number(qty) || 1;
  saveCart(cart); renderCart(); updateCartBadge();
}
function getCartTotal(){
  return getCart().reduce((s,i)=> s + i.price * i.qty, 0);
}
function getCartCount(){
  return getCart().reduce((s,i)=> s + i.qty, 0);
}
function saveOrder(order){
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
function updateCartBadge(){
  const el = document.querySelectorAll(".cart-badge");
  el.forEach(node => node.textContent = getCartCount());
}

/* ---------- MENU PAGE ---------- */
function loadMenu(containerId = "menu-container"){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = "";
  const grid = document.createElement("div"); grid.className = "grid cols-3";
  FOODS.forEach(f=>{
    const c = document.createElement("div"); c.className = "card";
    c.innerHTML = `
      <img class="food-img" src="${f.img}" alt="${f.name}">
      <h3>${f.name}</h3>
      <p style="opacity:.9">${f.desc}</p>
      <div style="margin-top:8px;font-weight:700">₹${f.price}</div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:center">
        <a href="details.html?id=${f.id}" class="btn">View</a>
        <button class="btn" onclick="addToCartById(${f.id})">Add to cart</button>
      </div>
    `;
    grid.appendChild(c);
  });
  container.appendChild(grid);
  updateCartBadge();
}

/* ---------- DETAILS PAGE ---------- */
function loadFoodDetails(containerId = "food-detail"){
  const container = document.getElementById(containerId);
  if(!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const f = FOODS.find(x => x.id === Number(id));
  if(!f){ container.innerHTML = "<p>Item not found</p>"; return; }
  container.innerHTML = `
    <div class="food-detail container">
      <img src="${f.img}" alt="${f.name}">
      <div>
        <h2>${f.name}</h2>
        <p style="opacity:.9">${f.desc}</p>
        <div style="margin-top:12px;font-weight:700">₹${f.price}</div>
        <div style="margin-top:14px">
          <button class="btn" onclick="addToCartById(${f.id})">Add to Cart</button>
          <a href="cart.html" class="btn" style="margin-left:10px">View Cart</a>
        </div>
      </div>
    </div>
  `;
  updateCartBadge();
}

/* ---------- CART PAGE ---------- */
function renderCart(containerId = "cart-items"){
  const container = document.getElementById(containerId);
  if(!container) return;
  const cart = getCart();
  container.innerHTML = "";
  if(cart.length === 0){
    container.innerHTML = `<p class="center" style="opacity:.9">Your cart is empty. <a href="menu.html">Browse menu</a></p>`;
    document.getElementById && document.getElementById("cart-total") && (document.getElementById("cart-total").textContent = "0");
    updateCartBadge();
    return;
  }
  cart.forEach(item=>{
    const div = document.createElement("div"); div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div style="flex:1">
        <div style="font-weight:700">${item.name}</div>
        <div style="opacity:.9">₹${item.price} each</div>
        <div style="margin-top:8px">
          <label>Qty: <input type="number" value="${item.qty}" min="1" style="width:70px" onchange="updateQty(${item.id}, this.value)"></label>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">₹${item.price * item.qty}</div>
        <div style="margin-top:8px">
          <button onclick="removeFromCart(${item.id})" style="background:transparent;border:1px solid rgba(255,255,255,0.06);color:#fff;padding:8px;border-radius:8px">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
  const total = getCartTotal();
  const totalSpan = document.getElementById("cart-total");
  totalSpan && (totalSpan.textContent = total);
  updateCartBadge();
}

/* ---------- ORDER PAGE ---------- */
function loadOrderPage(){
  const summary = document.getElementById("order-summary");
  if(!summary) return;
  const cart = getCart();
  if(cart.length === 0){
    summary.innerHTML = `<p>Your cart is empty. <a href="menu.html">Go to menu</a></p>`;
    return;
  }
  let html = `<div style="max-width:760px;margin:0 auto">`;
  cart.forEach(i=>{
    html += `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed rgba(255,255,255,0.04)"><div>${i.name} x ${i.qty}</div><div>₹${i.price * i.qty}</div></div>`;
  });
  html += `<div style="padding:12px 0;font-weight:700">Total: ₹${getCartTotal()}</div>`;
  html += `<div style="margin-top:12px"><a class="btn" href="payment.html">Proceed to Payment</a></div></div>`;
  summary.innerHTML = html;
}

/* ---------- PAYMENT PAGE ---------- */
function simulatePayment(method){
  // Save order and clear cart
  const cart = getCart();
  if(cart.length === 0) { alert("Cart empty"); location.href="menu.html"; return; }
  const order = {
    id: Date.now(),
    items: cart,
    total: getCartTotal(),
    method,
    time: new Date().toISOString()
  };
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  clearCart();
  updateCartBadge();
  // redirect to success page
  location.href = "success.html?orderId=" + order.id;
}

/* ---------- SUCCESS PAGE ---------- */
function loadSuccess(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get("orderId");
  const msg = document.getElementById("success-msg");
  if(msg){
    msg.innerHTML = `<h2>Order #${id} confirmed 🎉</h2><p>Your food is being prepared. Enjoy!</p>`;
  }
}

/* ---------- REPORT PAGE ---------- */
function loadReport(){
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  document.getElementById && document.getElementById("report-count") && (document.getElementById("report-count").textContent = orders.length);
  const total = orders.reduce((s,o)=> s + Number(o.total || 0),0);
  document.getElementById && document.getElementById("report-total") && (document.getElementById("report-total").textContent = total);
}

/* ---------- CONTACT FORM (no backend) ---------- */
function initContactForm(){
  const form = document.querySelector(".contact-form");
  if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    alert("Thanks! Your message was received. We'll contact you soon.");
    form.reset();
  });
}

/* ---------- INIT helpers to run on page load ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartBadge();
  // call page-specific initializers by checking existence
  if(document.getElementById("menu-container")) loadMenu();
  if(document.getElementById("food-detail")) loadFoodDetails();
  if(document.getElementById("cart-items")) renderCart();
  if(document.getElementById("order-summary")) loadOrderPage();
  if(document.getElementById("final-total")) { const el=document.getElementById("final-total"); el.textContent = getCartTotal(); }
  if(document.getElementById("report-count")) loadReport();
  if(document.getElementById("success-msg")) loadSuccess();
  initContactForm();
});
