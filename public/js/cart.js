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

function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
    toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
