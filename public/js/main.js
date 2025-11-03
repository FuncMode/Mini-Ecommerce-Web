let allProducts = [];
let cart = [];
let selectedProduct = null;
let debounceTimer = null;
const EXCHANGE_RATE = 56;

// ==========================================================
// INITIAL LOAD
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCartFromDB();
  setupEventListeners();
});

// ==========================================================
// FETCH PRODUCTS
// ==========================================================
async function loadProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (err) {
    console.error('Product Fetch Error:', err);
  }
}

// ==========================================================
// PRODUCT DISPLAY
// ==========================================================
function renderProducts(products) {
  const productList = document.getElementById('productList');

  if (!products.length) {
    productList.innerHTML = `<p class="text-center text-muted">No products found.</p>`;
    return;
  }

  productList.innerHTML = products.map(product => `
    <div class="col-md-4 col-lg-3 d-flex">
      <div class="card w-100 shadow-sm product-card">
        <img src="${product.image}" class="card-img-top"
          alt="${product.title}" style="height: 200px; object-fit: contain;">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h6 class="card-title">${product.title}</h6>
            <p class="text-success fw-bold mb-3">₱${(product.price * EXCHANGE_RATE).toFixed(2)}</p>
          </div>
          <!-- data-id used so we can delegate click events -->
          <button class="btn btn-secondary w-100 mt-auto view-item-btn"
            data-id="${product.id}">View Item</button>
        </div>
      </div>
    </div>
  `).join('');

  // simple animation 
  document.querySelectorAll('.product-card').forEach((card, i) =>
    setTimeout(() => card.classList.add('visible'), i * 100)
  );
}

// ==========================================================
// SEARCH & FILTERS
// ==========================================================
function setupEventListeners() {
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 400);
  });

  document.getElementById('categoryFilter').addEventListener('change', applyFilters);

  // Global click delegate: catches view-item and other dynamic buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains("view-item-btn")) {
      viewItem(Number(e.target.dataset.id));
    }
  });
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const category = document.getElementById('categoryFilter').value;
  
  // Copy allProducts so original array stays intact
  let filtered = [...allProducts];

  if (category !== "all") filtered = filtered.filter(p => p.category === category);
  if (search) filtered = filtered.filter(p =>
    p.title.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search)
  );

  renderProducts(filtered);
}

// ==========================================================
// PRODUCT DETAILS MODAL
// ==========================================================
function viewItem(id) {
  selectedProduct = allProducts.find(p => p.id === id);
  if (!selectedProduct) return; // safety check

  const peso = (selectedProduct.price * EXCHANGE_RATE).toFixed(2);

  document.getElementById('detailsContent').innerHTML = `
    <div class="text-center">
      <img src="${selectedProduct.image}" style="max-width:150px;height:150px;object-fit:contain;">
      <h6 class="mt-3">${selectedProduct.title}</h6>
      <p class="text-success fw-bold mb-2">₱${peso}</p>
    </div>

    <div class="d-flex justify-content-center align-items-center mb-3">
      <button class="btn btn-outline-secondary qty-btn" data-change="-1">-</button>
      <input type="number" id="quantity" class="form-control mx-2 text-center" value="1" min="1" style="width:70px;">
      <button class="btn btn-outline-secondary qty-btn" data-change="1">+</button>
    </div>

    <p class="text-center fw-bold">Total: ₱<span id="totalPrice">${peso}</span></p>

    <div class="d-grid">
      <button class="btn btn-primary" id="addToCartBtn">Add to Cart</button>
      <button class="btn btn-danger mt-2" id="closeDetailsBtn">Close</button>
    </div>
  `;

  document.getElementById('productDetails').style.display = "block";

  // quantity adjustments:
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => changeQuantity(Number(btn.dataset.change)));
  });

  // addToCart button listener
  document.getElementById("addToCartBtn").addEventListener("click", addToCart);

  // close button listener
  document.getElementById("closeDetailsBtn").addEventListener("click", closeDetails);
}

function changeQuantity(step) {
  const qtyInput = document.getElementById('quantity');
  const qty = Math.max(1, Number(qtyInput.value) + step);
  qtyInput.value = qty;
  document.getElementById('totalPrice').textContent =
    (selectedProduct.price * EXCHANGE_RATE * qty).toFixed(2);
}

function closeDetails() {
  document.getElementById('productDetails').style.display = "none";
}

// ==========================================================
// CART (DB SYNC)
// ==========================================================
async function addToCart() {
  // Kukunin yung username na naka-login (naka-store sa browser storage)
  const username = localStorage.getItem("username");

  // Kung walang naka-login, bawal mag-add to cart
  if (!username) {
    return Swal.fire({
      icon: "error",
      title: "Not logged in",
      text: "Please log in first."
    });
  }

  // Quantity na in-input ng user
  const qty = Number(document.getElementById("quantity").value);

  // Convert USD → PHP (based on selectedProduct price)
  const pesoPrice = selectedProduct.price * EXCHANGE_RATE;

  // I-check kung valid yung quantity
  if (qty <= 0 || isNaN(qty)) {
    return Swal.fire({
      icon: "warning",
      title: "Invalid quantity",
      text: "Please enter a valid number."
    });
  }

  // Loading indicator habang nagse-send ng request
  Swal.fire({
    title: "Adding to cart...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Ipadala yung item details sa backend API
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        product_id: selectedProduct.id,
        product_name: selectedProduct.title,
        price: pesoPrice,
        quantity: qty
      })
    });

    const data = await response.json();
    Swal.close(); // Close loading popup

    // Kung success (status code 200-299)
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Added to cart!",
        text: data.message,
        timer: 900,
        showConfirmButton: false
      });

      closeDetails(); // Close product details modal
      loadCartFromDB(); // Reload cart UI para makita update

    } else {
      // If may error sa backend (e.g. duplicate, fail query)
      Swal.fire({ icon: "error", title: "Error", text: data.message });
    }
  } catch (error) {
    // Pag walang connection or backend down
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Server error",
      text: "Could not connect to backend."
    });
  }
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div></div>`;
  document.body.appendChild(toast);

  // Auto-remove pagkatapos ng 3 seconds
  setTimeout(() => toast.remove(), 3000);
}

// loadCartFromDB:
async function loadCartFromDB() {
  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    const res = await fetch(`/api/cart?username=${username}`);
    const data = await res.json();

    if (data.success) {
      // Merge duplicates by product_id
      const merged = {};

      data.cart.forEach(item => {
        if (!merged[item.product_id]) {
          merged[item.product_id] = {
            id: item.product_id,
            title: item.product_name,
            price: Number(item.price),
            quantity: item.quantity,
          };
        } else {
          merged[item.product_id].quantity += item.quantity;
        }
      });

      cart = Object.values(merged).map(item => ({
        ...item,
        total: item.price * item.quantity
      }));

      updateCartBadge();
    }
  } catch (err) {
    console.error("Error loading cart:", err);
  }
}


// ==========================================================
// CART UI
// ==========================================================
document.getElementById('cartBtn').addEventListener('click', () => {
  renderCart();
  new bootstrap.Modal(document.getElementById('cartModal')).show();
});

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  if (!cart.length) {
    cartItems.innerHTML = `<p class="text-center text-muted">Your cart is empty.</p>`;
    cartTotal.textContent = "0.00";
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
      <div>
        <strong>${item.title}</strong><br>
        <small>₱${item.price.toFixed(2)} × ${item.quantity}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fw-bold">₱${item.total.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger remove-item-btn" data-index="${index}">Remove</button>
      </div>
    </div>
  `).join('');

  cartTotal.textContent = cart.reduce((s, i) => s + i.total, 0).toFixed(2);

  // Attach remove handlers to each remove button
  document.querySelectorAll(".remove-item-btn").forEach(btn => {
    btn.addEventListener("click", () => removeItem(Number(btn.dataset.index)));
  });
}

function updateCartBadge() {
  const existingBadge = document.getElementById('cartCount');
  if (existingBadge) existingBadge.remove();

  if (cart.length > 0) {
    const badge = document.createElement('span');
    badge.id = 'cartCount';
    badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
    badge.textContent = cart.length;
    badge.style.fontSize = '0.75rem';
    badge.style.transform = 'translate(-40%, 40%)';
    cartBtn.style.position = 'relative';
    cartBtn.appendChild(badge);
  }
}

// ==========================================================
// REMOVE ITEM
// ==========================================================
async function removeItem(index) {
  const username = localStorage.getItem("username");
  if (!username) {
    Swal.fire("Error", "Log in first.", "error");
    return;
  }

  const item = cart[index];
  if (!item) return;

  // Auto-delete when only 1 exists
  if (item.quantity === 1) {
    try {
      await fetch('/api/cart/remove', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, product_id: item.id, removeQty: 1 })
      });
      await loadCartFromDB();
      renderCart();
    } catch (err) {
      console.error("Remove error:", err);
      Swal.fire("Error", "Could not remove item.", "error");
    }
    return;
  }

  // Prompt user for number to remove when qty >= 2
  const { value: qty } = await Swal.fire({
    title: `Remove Quantity`,
    input: 'number',
    inputValue: 1,
    inputAttributes: { min: 1, max: item.quantity, step: 1 },
    showCancelButton: true,
    confirmButtonText: "Remove",
  });

  // If user cancels or enters invalid value, stop
  if (!qty) return;

  try {
    await fetch('/api/cart/remove', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, product_id: item.id, removeQty: Number(qty) })
    });
    await loadCartFromDB();
    renderCart();
  } catch (err) {
    console.error("Remove error:", err);
    Swal.fire("Error", "Could not remove items.", "error");
  }
}

// ==========================================================
// CHECKOUT
// ========================================================== 
document.getElementById('checkoutBtn').addEventListener("click", async () => {
  if (!cart.length) return Swal.fire("Empty Cart", "", "warning");

  const username = localStorage.getItem("username");
  if (!username) return Swal.fire("Error", "Log in first.", "error");

  const total = cart.reduce((s,i)=>s+i.total,0).toFixed(2);

  Swal.fire({
    icon:'success',
    title:'Checkout Complete!',
    html:`<p>Total Paid: <strong>₱${total}</strong></p>`,
    confirmButtonText:'Done'
  });

  try {
    await fetch('/api/cart/clear', {
      method:'DELETE',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ username })
    });

    await loadCartFromDB();
    renderCart();
  } catch (err) {
    console.error("Clear cart error:", err);
    Swal.fire("Error", "Could not clear cart.", "error");
  }
});

// ==========================================================
// THEME & LOGOUT
// ==========================================================
const themeToggle = document.getElementById("themeToggle");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  if (themeToggle) themeToggle.textContent = "☀️";
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", mode);
    themeToggle.textContent = mode === "dark" ? "☀️" : "🌙";
  });
}


//==========================
// LOGOUT
//==========================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      icon:"warning",
      title:"Sign out?",
      showCancelButton:true
    }).then(res => {
      if (res.isConfirmed) {
        localStorage.removeItem("username");
        window.location.href = "/";
      }
    });
  });
}

