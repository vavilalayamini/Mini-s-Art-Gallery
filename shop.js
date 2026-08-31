const CONFIG = window.MINI_CONFIG || {};
const PRODUCTS = [
  {
    id: "krishna-portrait",
    title: "Krishna-Inspired Portrait",
    category: "Portrait · Pencil Art",
    price: 1499,
    image: "images/krishna-art.jpg",
    description: "A soft, expressive hand-drawn portrait with traditional-inspired details.",
    size: "Original artwork"
  },
  {
    id: "sacred-mandala",
    title: "Sacred Symbol Mandala",
    category: "Ink · Sacred Art",
    price: 1899,
    image: "images/sacred-mandala.jpg",
    description: "Detailed circular ink artwork with ornamental spirals and a vivid central accent.",
    size: "Original artwork"
  }
];

const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat("en-IN", {style:"currency", currency:"INR", maximumFractionDigits:0}).format(n);
const shippingFor = subtotal => subtotal >= (CONFIG.freeShippingThreshold ?? 2500) ? 0 : (CONFIG.shippingFlatRate ?? 99);

let cart = JSON.parse(localStorage.getItem("mini_cart") || "[]");

function product(id){ return PRODUCTS.find(p => p.id === id); }
function saveCart(){ localStorage.setItem("mini_cart", JSON.stringify(cart)); }
function cartSubtotal(){ return cart.reduce((s,i) => s + product(i.id).price * i.qty, 0); }
function cartCount(){ return cart.reduce((s,i) => s + i.qty, 0); }

function renderProducts(){
  $("#productGrid").innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <button class="product-image" data-detail="${p.id}" aria-label="View ${p.title}">
        <img src="${p.image}" alt="${p.title}">
        <span class="quick-add">Quick add +</span>
      </button>
      <div class="product-info">
        <div><span class="category">${p.category}</span><span class="price">${money(p.price)}</span></div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="product-actions">
          <button class="add-btn" data-add="${p.id}">Add to bag</button>
          <button class="details-btn" data-detail="${p.id}">Details</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart(){
  $("#cartCount").textContent = cartCount();
  if(!cart.length){
    $("#cartItems").innerHTML = `<div class="empty-cart"><div>♡</div><h3>Your bag is empty</h3><p>Find a piece you love and make it yours.</p><a class="btn outline" href="#shop" id="shopFromEmpty">Browse art</a></div>`;
  } else {
    $("#cartItems").innerHTML = cart.map(i => {
      const p = product(i.id);
      return `<div class="cart-line">
        <img src="${p.image}" alt="">
        <div class="cart-line-main"><b>${p.title}</b><small>${money(p.price)}</small>
          <div class="qty"><button data-dec="${p.id}">−</button><span>${i.qty}</span><button data-inc="${p.id}">+</button><button class="remove" data-remove="${p.id}">Remove</button></div>
        </div>
      </div>`;
    }).join("");
  }
  const sub = cartSubtotal(), ship = cart.length ? shippingFor(sub) : 0;
  $("#cartSubtotal").textContent = money(sub);
  $("#cartShipping").textContent = ship ? money(ship) : (cart.length ? "FREE" : money(0));
  $("#cartTotal").textContent = money(sub + ship);
  $("#checkoutBtn").disabled = !cart.length;
}

function add(id){
  const existing = cart.find(i => i.id === id);
  existing ? existing.qty++ : cart.push({id, qty:1});
  saveCart(); renderCart(); openCart();
}
function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}
function remove(id){ cart = cart.filter(i => i.id !== id); saveCart(); renderCart(); }

function openCart(){ $("#cartDrawer").classList.add("open"); $("#backdrop").classList.add("show"); }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#backdrop").classList.remove("show"); }

function openCheckout(){
  if(!cart.length) return;
  closeCart();
  renderCheckout();
  $("#checkoutModal").classList.add("show");
  document.body.classList.add("modal-open");
}
function closeCheckout(){
  $("#checkoutModal").classList.remove("show");
  document.body.classList.remove("modal-open");
}

function renderCheckout(){
  const sub = cartSubtotal(), ship = shippingFor(sub), total = sub + ship;
  $("#checkoutPayAmount").textContent = money(total);
  $("#upiIdText").textContent = CONFIG.upiId || "YOUR-UPI-ID@bank";
  $("#checkoutProducts").innerHTML = cart.map(i => {
    const p = product(i.id);
    return `<div class="checkout-product"><img src="${p.image}"><div><b>${p.title}</b><span>Qty ${i.qty} · ${money(p.price)}</span></div><strong>${money(p.price*i.qty)}</strong></div>`;
  }).join("");
  $("#checkoutSummary").innerHTML = cart.map(i => {
    const p = product(i.id);
    return `<div><span>${p.title} × ${i.qty}</span><b>${money(p.price*i.qty)}</b></div>`;
  }).join("") + `<div><span>Shipping</span><b>${ship ? money(ship) : "FREE"}</b></div>`;
  $("#sideTotal").textContent = money(total);
}

function createUpiUrl(){
  const sub = cartSubtotal(), total = sub + shippingFor(sub);
  const params = new URLSearchParams({
    pa: CONFIG.upiId || "",
    pn: CONFIG.upiName || "Mini's Art Gallery",
    am: total.toFixed(2),
    cu: "INR",
    tn: "Mini's Art Gallery order"
  });
  return `upi://pay?${params.toString()}`;
}

async function submitOrder(event){
  event.preventDefault();
  const button = $("#placeOrder");
  const form = new FormData(event.currentTarget);
  const orderId = `MAG-${Date.now().toString().slice(-8)}`;
  const sub = cartSubtotal(), shipping = shippingFor(sub), total = sub + shipping;
  const items = cart.map(i => { const p = product(i.id); return {product_id:p.id, title:p.title, quantity:i.qty, unit_price:p.price}; });
  const order = {
    order_number: orderId,
    customer_name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    pincode: form.get("pincode"),
    address: form.get("address"),
    note: form.get("note") || "",
    payment_method: "UPI",
    payment_reference: form.get("payment_ref"),
    subtotal: sub, shipping, total, items,
    status: "Payment submitted",
    created_at: new Date().toISOString()
  };

  button.disabled = true; button.textContent = "Submitting…";

  try {
    if(window.supabaseClient){
      const { error } = await window.supabaseClient.from("orders").insert(order);
      if(error) throw error;
    } else {
      const local = JSON.parse(localStorage.getItem("mini_orders") || "[]");
      local.push(order);
      localStorage.setItem("mini_orders", JSON.stringify(local));
    }

    $("#successOrderId").textContent = orderId;
    $("#checkoutFormView").hidden = true;
    $("#orderSuccess").hidden = false;
    cart = []; saveCart(); renderCart();
  } catch(err) {
    console.error(err);
    alert("We could not submit the order. Please check your internet connection or the store setup.");
  } finally {
    button.disabled = false; button.textContent = "Place order";
  }
}

function showProduct(id){
  const p = product(id);
  if(!p) return;
  const qty = prompt(`${p.title}\n\n${p.description}\n\nPrice: ${money(p.price)}\n\nEnter quantity to add:`, "1");
  const n = Math.max(1, parseInt(qty,10) || 1);
  for(let i=0;i<n;i++) add(id);
}

document.addEventListener("click", e => {
  const addId = e.target.closest("[data-add]")?.dataset.add;
  const detailId = e.target.closest("[data-detail]")?.dataset.detail;
  const inc = e.target.closest("[data-inc]")?.dataset.inc;
  const dec = e.target.closest("[data-dec]")?.dataset.dec;
  const rem = e.target.closest("[data-remove]")?.dataset.remove;
  if(addId) add(addId);
  if(detailId && !addId) showProduct(detailId);
  if(inc) changeQty(inc,1);
  if(dec) changeQty(dec,-1);
  if(rem) remove(rem);
  if(e.target.id === "shopFromEmpty"){ closeCart(); }
});

$("#openCart").onclick = openCart;
$("#closeCart").onclick = closeCart;
$("#backdrop").onclick = closeCart;
$("#checkoutBtn").onclick = openCheckout;
$("#closeCheckout").onclick = closeCheckout;
$("#orderForm").addEventListener("submit", submitOrder);
$("#continueShopping").onclick = closeCheckout;
$("#payUpi").onclick = () => {
  if(!CONFIG.upiId){ alert("Add your UPI ID in config.js before using UPI checkout."); return; }
  window.location.href = createUpiUrl();
};
$("#copyUpi").onclick = async () => {
  const id = CONFIG.upiId || "";
  if(!id){ alert("Add your UPI ID in config.js first."); return; }
  await navigator.clipboard.writeText(id);
  $("#copyUpi").textContent = "Copied ✓";
  setTimeout(() => $("#copyUpi").textContent = "Copy UPI ID", 1400);
};

renderProducts(); renderCart();
$("#year").textContent = new Date().getFullYear();
