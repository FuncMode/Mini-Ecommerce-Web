let allProducts = [];
let debounceTimer;
let selectedProduct = null;
let cart = [];

// DOM ready — auto load cart kung logged in
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromDB();
});

// Fetch all products once
fetch('https://fakestoreapi.com/products')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderProducts(data);
  })
  .catch(err => console.error('Error fetching products:', err));

/* -------------------------------------------------------------------------- */
/* PRODUCT DISPLAY & FILTERS */
/* -------------------------------------------------------------------------- */

function renderProducts(products) {
  const productList = document.getElementById('productList');
  if (products.length === 0) {
    productList.innerHTML = `<p class="text-center text-muted">No products found.</p>`;
    return;
  }

  productList.innerHTML = products.map(product => `
    <div class="col-md-4 col-lg-3 d-flex">
      <div class="card w-100 shadow-sm product-card">
        <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: contain;">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h6 class="card-title product-title">${product.title}</h6>
            <p class="card-text text-success fw-bold mb-3">₱${(product.price * 56).toFixed(2)}</p>
          </div>
          <button class="btn btn-secondary w-100 mt-auto" onclick="viewItem(${product.id})">View Item</button>
        </div>
      </div>
    </div>
  `).join('');

  // animation delay
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, index) => {
    setTimeout(() => card.classList.add('visible'), 100 * index);
  });
}

// Filters setup
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => applyFilters(), 400);
});

document.getElementById('categoryFilter').addEventListener('change', () => applyFilters());

function applyFilters() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  let filtered = allProducts;

  if (category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category);
  }

  if (searchValue !== "") {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchValue) ||
      p.category.toLowerCase().includes(searchValue)
    );
  }

  renderProducts(filtered);
}

/* -------------------------------------------------------------------------- */
/* PRODUCT DETAILS MODAL */
/* -------------------------------------------------------------------------- */

function viewItem(id) {
  const product = allProducts.find(p => p.id === id);
  selectedProduct = product;

  const details = document.getElementById('productDetails');
  const content = document.getElementById('detailsContent');
  const pesoPrice = (product.price * 56).toFixed(2);

  content.innerHTML = `
    <div class="text-center">
      <img src="${product.image}" alt="${product.title}" style="max-width: 150px; height: 150px; object-fit: contain;">
      <h6 class="mt-3">${product.title}</h6>
      <p class="text-success fw-bold mb-2">₱${pesoPrice}</p>
    </div>
    <div class="quantity-control d-flex justify-content-center align-items-center mb-3">
      <button class="btn btn-outline-secondary" onclick="changeQuantity(-1)">-</button>
      <input type="number" id="quantity" class="form-control mx-2 text-center" value="1" min="1" style="width:70px;">
      <button class="btn btn-outline-secondary" onclick="changeQuantity(1)">+</button>
    </div>
    <p class="text-center fw-bold">Total: ₱<span id="totalPrice">${pesoPrice}</span></p>
    <div class="d-grid">
      <button class="btn btn-primary" onclick="addToCart()">Add to Cart</button>
      <button class="btn btn-danger mt-2" onclick="closeDetails()">Close</button>
    </div>
  `;

  details.style.display = "block";
}

function changeQuantity(change) {
  const qtyInput = document.getElementById('quantity');
  let qty = parseInt(qtyInput.value);
  qty = Math.max(1, qty + change);
  qtyInput.value = qty;

  const total = (selectedProduct.price * 56 * qty).toFixed(2);
  document.getElementById('totalPrice').textContent = total;
}

function closeDetails() {
  document.getElementById('productDetails').style.display = 'none';
  selectedProduct = null;
}

/* -------------------------------------------------------------------------- */
/* CART HANDLING (DB SYNCED) */
/* -------------------------------------------------------------------------- */

async function addToCart() {
  const username = localStorage.getItem("username");
  if (!username) {
    Swal.fire({ icon: "error", title: "Not logged in", text: "Please log in first." });
    return;
  }

  const qty = parseInt(document.getElementById('quantity').value);
  const pesoPrice = selectedProduct.price * 56;

  Swal.fire({
    title: 'Adding to cart...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        product_id: selectedProduct.id,
        product_name: selectedProduct.title,
        price: pesoPrice,
        quantity: qty
      })
    });

    const data = await res.json();
    Swal.close();

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Added to cart!',
        text: data.message,
        timer: 1000,
        showConfirmButton: false
      });
      closeDetails();
      await loadCartFromDB();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.message });
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Server error', text: 'Could not connect to backend.' });
  }
}

async function loadCartFromDB() {
  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    const res = await fetch(`/api/cart?username=${username}`);
    const data = await res.json();

    if (data.success) {
      cart = data.cart.map(item => ({
        id: item.product_id,
        title: item.product_name,
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.price) * item.quantity
      }));
      updateCartBadge();
    }
  } catch (err) {
    console.error("Error loading cart:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* CART UI (MODAL + BADGE + CHECKOUT) */
/* -------------------------------------------------------------------------- */

const cartBtn = document.getElementById('cartBtn');
cartBtn.addEventListener('click', openCart);

async function openCart() {
  await loadCartFromDB();
  renderCart();
  const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
  cartModal.show();
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="text-center text-muted">Your cart is empty.</p>`;
    cartTotal.textContent = "0.00";
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
      <div>
        <strong>${item.title}</strong><br>
        <small>₱${item.price.toFixed(2)} × ${item.quantity}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="fw-bold">₱${item.total.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger" onclick="removeItem(${index})">Remove</button>
      </div>
    </div>
  `).join('');

  cartTotal.textContent = cart.reduce((s, i) => s + i.total, 0).toFixed(2);
}

// Auto-refresh cart every 3 seconds
setInterval(async () => {
  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    await loadCartFromDB();
    renderCart();         
  } catch (err) {
    console.error("Error auto-refreshing cart:", err);
  }
}, 3000);

document.getElementById('checkoutBtn').addEventListener('click', async () => {
  const username = localStorage.getItem("username");
  if (!username) return;

  if (cart.length === 0) {
    Swal.fire({ icon: 'warning', title: 'Cart is empty!' });
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.total, 0).toFixed(2);

  Swal.fire({
    icon: 'success',
    title: 'Checkout Successful!',
    html: `
      <h6>🧾 Items Purchased:</h6>
      <ul class="list-unstyled">
        ${cart.map(i => `<li>${i.title} × ${i.quantity} — ₱${i.total.toFixed(2)}</li>`).join('')}
      </ul>
      <hr>
      <p><strong>Total Paid:</strong> ₱${total}</p>
    `,
    confirmButtonText: 'Done'
  });

  await fetch('/api/cart/clear', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });

  await loadCartFromDB();
  renderCart();
});

// Update cart badge
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

// Remove item / quantity
async function removeItem(index) {
  const username = localStorage.getItem("username");
  const item = cart[index];

  if (item.quantity === 1) {
    await removeRequest(1);
    return;
  }

  const { value: qty } = await Swal.fire({
    title: `Remove quantity`,
    input: 'number',
    inputAttributes: { min: 1, max: item.quantity },
    inputValue: 1,
    showCancelButton: true,
  });

  if (!qty) return;
  await removeRequest(Number(qty));

  async function removeRequest(removeQty) {
    await fetch('/api/cart/remove', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, product_id: item.id, removeQty })
    });
    await loadCartFromDB();
    renderCart();
  }
}

const themeToggle = document.getElementById("themeToggle");

// Load saved preference
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  Swal.fire({
    icon: "warning",
    title: "Sign out?",
    text: "Are you sure you want to sign out?",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No"
  }).then((res) => {
    if (res.isConfirmed) {
      localStorage.removeItem("username");
      window.location.href = "/";
    }
  });
});
