// public/js/register.js

// =======================
// REGISTER FORM SUBMIT
// =======================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Stop page reload

  // Kukunin yung user input
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Check kung may number sa password
  const hasNumber = /\d/.test(password);

  // Basic validation (username / password must ≥ 6 chars & may number)
  if (username.length < 6 || password.length < 6 || !hasNumber) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid Input',
      text: 'Password must have at least 6 characters and include at least 1 number.'
    });
  }

  // Show loading popup habang nagse-send sa server
  Swal.fire({
    title: 'Creating account...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Send register request to backend API
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    Swal.close(); // Close loading modal

    // ✅ Registration successful
    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Account created!',
        text: data.message || 'You can now log in.',
        showConfirmButton: false,
        timer: 1500
      });

      // Redirect sa login page
      setTimeout(() => window.location.href = '/', 1600);
      return;
    }

    // ❌ Registration failed (example: username already exists)
    Swal.fire({
      icon: 'error',
      title: 'Registration failed',
      text: data.message || 'Please try again.'
    });

  } catch (err) {
    console.error(err);

    // ❌ Server / connection error
    Swal.fire({
      icon: 'error',
      title: 'Server error',
      text: 'Could not connect to the server.'
    });
  }
});


// =======================
// SHOW / HIDE PASSWORD
// =======================

// Elements
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('togglePassword');
const icon = document.getElementById('toggleIcon');

// Toggle password visibility (eye ↔ eye-slash)
toggleBtn.addEventListener('click', () => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';

  icon.classList.toggle('bi-eye');
  icon.classList.toggle('bi-eye-slash');
});
