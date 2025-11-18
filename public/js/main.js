let allProducts = []; // Storage ng lahat ng products galing API
let cart = []; // Local cart data (display only)
let selectedProduct = null; // Product na currently tinitingnan sa modal
let debounceTimer = null; // Timer para sa search delay
const EXCHANGE_RATE = 56; // USD -> PHP conversion

document.addEventListener("DOMContentLoaded", () => { // Pag load ng page
  loadProducts(); // Fetch products
  loadCartFromDB(); // Load cart sa database
  setupEventListeners(); // Attach event listeners
});

async function loadProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products'); // Get products from API
    if (!res.ok) throw new Error(`Server Error: ${res.status}`); // Check request success
    allProducts = await res.json(); // Convert response to JSON
    renderProducts(allProducts); // Display products
  } catch (err) {
    console.error('Product Fetch Error:', err); // Error log
  }
}

function renderProducts(products) {
  const productList = document.getElementById('productList'); // Container ng item cards

  if (!products.length) { // If no results
    productList.innerHTML = `<p class="text-center text-muted">No products found.</p>`;
    return;
  }

  // Generate product cards
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
          <button class="btn btn-secondary w-100 mt-auto view-item-btn"
            data-id="${product.id}">View Item</button>
        </div>
      </div>
    </div>
  `).join('');

  // Smooth fade animation per item
  document.querySelectorAll('.product-card').forEach((card, i) =>
    setTimeout(() => card.classList.add('visible'), i * 100)
  );
}

function setupEventListeners() {
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(debounceTimer); // Clear previous timer
    debounceTimer = setTimeout(applyFilters, 400); // Search delay
  });

  document.getElementById('categoryFilter').addEventListener('change', applyFilters); // Category change

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains("view-item-btn")) { // View Item button clicked
      viewItem(Number(e.target.dataset.id)); // Get item by ID
    }
  });
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim(); // Search term
  const category = document.getElementById('categoryFilter').value; // Category value

  let filtered = [...allProducts]; // Copy original list

  if (category !== "all") filtered = filtered.filter(p => p.category === category); // Filter by category
  if (search) filtered = filtered.filter(p =>
    p.title.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search)
  ); // Filter by search

  renderProducts(filtered); // Re-render products
}

function viewItem(id) {
  selectedProduct = allProducts.find(p => p.id === id); // Hanapin product by ID
  if (!selectedProduct) return;

  const peso = (selectedProduct.price * EXCHANGE_RATE).toFixed(2); // Convert price to PHP

  // Fill modal content
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

  document.getElementById('productDetails').style.display = "block"; // Show modal

  // Quantity buttons
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => changeQuantity(Number(btn.dataset.change)));
  });

  document.getElementById("addToCartBtn").addEventListener("click", addToCart); // Add to cart handler
  document.getElementById("closeDetailsBtn").addEventListener("click", closeDetails); // Close modal handler
}

function changeQuantity(step) {
  const qtyInput = document.getElementById('quantity'); // Quantity input
  const qty = Math.max(1, Number(qtyInput.value) + step); // Prevent 0/negative
  qtyInput.value = qty;
  document.getElementById('totalPrice').textContent =
    (selectedProduct.price * EXCHANGE_RATE * qty).toFixed(2); // Update total price
}

function closeDetails() {
  document.getElementById('productDetails').style.display = "none"; // Hide modal
}

async function addToCart() {
  const user_id = localStorage.getItem("user_id"); // Get logged in user
  if (!user_id) return Swal.fire({ icon: "error", title: "Not logged in", text: "Please log in first." });

  const qty = Number(document.getElementById("quantity").value); // Quantity selected
  const pesoPrice = selectedProduct.price * EXCHANGE_RATE; // Price in PHP

  Swal.fire({ title: "Adding to cart...", allowOutsideClick: false, didOpen: () => Swal.showLoading() }); // Loading modal

  try {
    // Send to backend /api/cart/add
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.title,
        price: pesoPrice,
        quantity: qty
      })
    });

    const data = await response.json();
    Swal.close();

    if (response.ok) { // Success
      Swal.fire({ icon: "success", title: "Added to cart!", text: data.message, timer: 900, showConfirmButton: false });
      closeDetails();
      loadCartFromDB(); // Re-fetch cart from DB
    } else {
      Swal.fire({ icon: "error", title: "Error", text: data.message }); // Error message
    }
  } catch (error) {
    Swal.close();
    Swal.fire({ icon: "error", title: "Server error", text: "Could not connect to backend." });
  }
}

async function loadCartFromDB() {
  const user_id = localStorage.getItem("user_id"); // Get logged in user
  if (!user_id) return;

  try {
    const res = await fetch(`/api/cart?user_id=${user_id}`); // Fetch cart data
    const data = await res.json();

    if (data.success) {
      const merged = {}; // Temporary object for merging duplicates

      data.cart.forEach(item => { // Loop through DB items
        if (!merged[item.product_id]) {
          merged[item.product_id] = {
            id: item.product_id,
            title: item.product_name,
            price: Number(item.price),
            quantity: item.quantity,
          };
        } else {
          merged[item.product_id].quantity += item.quantity; // Add qty if existing
        }
      });

      cart = Object.values(merged).map(item => ({
        ...item,
        total: item.price * item.quantity // Compute total price
      }));

      updateCartBadge(); // Update cart icon badge
    }
  } catch (err) {
    console.error("Error loading cart:", err); // Log error
  }
}

document.getElementById('cartBtn').addEventListener('click', () => {
  renderCart(); // Draw cart modal content
  new bootstrap.Modal(document.getElementById('cartModal')).show(); // Show modal
});

function renderCart() {
  const cartItems = document.getElementById('cartItems'); // Items container
  const cartTotal = document.getElementById('cartTotal'); // Total price display

  if (!cart.length) { // Empty cart
    cartItems.innerHTML = `<p class="text-center text-muted">Your cart is empty.</p>`;
    cartTotal.textContent = "0.00";
    return;
  }

  // Display cart items
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

  cartTotal.textContent = cart.reduce((s, i) => s + i.total, 0).toFixed(2); // Compute total

  document.querySelectorAll(".remove-item-btn").forEach(btn => {
    btn.addEventListener("click", () => removeItem(Number(btn.dataset.index))); // Remove handler
  });
}

function updateCartBadge() {
  const existingBadge = document.getElementById('cartCount'); // Check if badge exists
  if (existingBadge) existingBadge.remove(); // Remove old badge

  if (cart.length > 0) { // If cart not empty show badge
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

async function removeItem(index) {
  const user_id = localStorage.getItem("user_id"); // Check user login
  if (!user_id) return Swal.fire("Error", "Log in first.", "error");

  const item = cart[index]; // Target item
  if (!item) return;

  if (item.quantity === 1) { // If only one piece
    await fetch('/api/cart/remove', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, product_id: item.id, removeQty: 1 })
    });
    await loadCartFromDB(); // Refresh cart
    renderCart();
    return;
  }

  // Ask quantity to remove
  const { value: qty } = await Swal.fire({
    title: `Remove Quantity`,
    input: 'number',
    inputValue: 1,
    inputAttributes: { min: 1, max: item.quantity, step: 1 },
    showCancelButton: true,
    confirmButtonText: "Remove"
  });

  if (!qty) return; // Cancelled

  await fetch('/api/cart/remove', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, product_id: item.id, removeQty: Number(qty) })
  });

  await loadCartFromDB(); // Refresh cart
  renderCart();
}

document.getElementById('checkoutBtn').addEventListener("click", async () => {
  if (!cart.length) return Swal.fire("Empty Cart", "", "warning"); // No items

  const user_id = localStorage.getItem("user_id"); // Get user
  if (!user_id) return Swal.fire("Error", "Log in first.", "error");

  const total = cart.reduce((s,i)=>s+i.total,0).toFixed(2); // Compute total

  Swal.fire({
    icon:'success',
    title:'Checkout Complete!',
    html:`<p>Total Paid: <strong>₱${total}</strong></p>`,
    confirmButtonText:'Done'
  });

  await fetch('/api/cart/clear', {
    method:'DELETE',
    headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify({ user_id })
  });

  await loadCartFromDB(); // Clear cart visually
  renderCart();
});

const themeToggle = document.getElementById("themeToggle"); // Theme toggle button
const user_id = localStorage.getItem("user_id"); // Current user

function applyUserTheme() {
  if (!user_id) return;

  const savedTheme = localStorage.getItem(`theme_${user_id}`) || "light"; // Load theme

  document.body.classList.toggle("dark-mode", savedTheme === "dark"); // Apply theme

  if (themeToggle) {
    themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙"; // Update toggle icon
  }
}

applyUserTheme(); // Apply theme on load

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(`theme_${user_id}`, newTheme); // Save theme

    themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙"; // Update icon
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      icon:"warning",
      title:"Sign out?",
      showCancelButton:true
    }).then(res => {
      if (res.isConfirmed) {
        localStorage.removeItem("user_id"); // Clear user session
        localStorage.removeItem("username");
        window.location.href = "/login"; // Redirect to login
      }
    });
  });
}
