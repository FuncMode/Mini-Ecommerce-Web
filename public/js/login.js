// public/js/login.js

// =======================
// LOGIN FORM SUBMIT
// =======================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); 

  // Kukunin yung input ng user
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Basic input validation (dapat ≥ 6 chars)
  if (username.length < 6 || password.length < 6) {
    return Swal.fire({
      icon: 'error',
      title: 'Invalid input',
      text: 'Username and password must be at least 6 characters.'
    });
  }

  // Show loading popup habang nagla-login
  Swal.fire({
    title: 'Logging in...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Send login request to backend API
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    Swal.close(); // alisin yung loading modal

    // Successful login
  if (res.ok) {
    localStorage.setItem("user_id", data.user_id || data.id || data.user?.id);
    localStorage.setItem("username", data.username || username);

    Swal.fire({
      icon: 'success',
      title: 'Login successful!',
      text: `Welcome, ${data.username || username}!`,
      showConfirmButton: false,
      timer: 1000
    });

    // Redirect
    setTimeout(() => window.location.href = '/main', 1100);
    return;
  }

    // Username does not exist
    if (res.status === 404 && data.message === 'Username not found') {
      return Swal.fire({
        icon: 'error',
        title: 'Username not found',
        text: 'Please register first.'
      });
    }

    // Wrong password
    if (res.status === 401 && data.message === 'Wrong password') {
      return Swal.fire({
        icon: 'error',
        title: 'Wrong password',
        text: 'Please check your password.'
      });
    }

    // Other login error
    Swal.fire({
      icon: 'error',
      title: 'Login failed',
      text: data.message || 'Invalid credentials'
    });

  } catch (err) {
    console.error(err);
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Server error',
      text: 'Could not connect to the backend.'
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

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';

  // Palitan ang icon (eye ↔ eye-slash)
  icon.classList.toggle('bi-eye');
  icon.classList.toggle('bi-eye-slash');
});
