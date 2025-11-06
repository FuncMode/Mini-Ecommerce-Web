// public/js/register.js

// ===== REGISTER FORM EVENT =====
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Stop automatic page refresh

  const username = document.getElementById('username').value.trim(); // Kukuha ng username input
  const password = document.getElementById('password').value.trim(); // Kukuha ng password input

  const hasNumber = /\d/.test(password); // Check kung may number sa password using regex literal

  // Basic validation rules
  if (username.length < 6 || password.length < 6 || !hasNumber) {
    return Swal.fire({ // Mag show ng error message
      icon: 'error',
      title: 'Invalid Input',
      text: 'Password must have at least 6 characters and include at least 1 number.'
    });
  }

  // Loading popup habang nagse-send request
  Swal.fire({
    title: 'Creating account...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Send request sa backend /api/auth/register
    const res = await fetch('/api/auth/register', {
      method: 'POST', // POST method dahil nagse-send ng data
      headers: { 'Content-Type': 'application/json' }, // Tells server na JSON format
      body: JSON.stringify({ username, password }), // Data na ipapasa sa backend
    });

    const data = await res.json(); // Convert response to JSON
    Swal.close(); // Close loading popup

    if (res.ok) { // If success (status 200-299)
      Swal.fire({
        icon: 'success', // Success message
        title: 'Account created!',
        text: data.message,
        showConfirmButton: false,
        timer: 1500
      });

      setTimeout(() => window.location.href = '/login', 1600); // Redirect to login page
      return;
    }

    // If error galing backend (e.g. username exists)
    Swal.fire({
      icon: 'error',
      title: 'Registration failed',
      text: data.message // message response from backend
    });

  } catch (err) {
    console.error(err); // Log error for debugging

    Swal.fire({
      icon: 'error', // Server error popup
      title: 'Server error',
      text: 'Could not connect to the server.' // minsan kase tulog yung server eh
    });
  }
});


// ===== SHOW / HIDE PASSWORD SECTION =====
const passwordInput = document.getElementById('password'); // Input field ng password
const toggleBtn = document.getElementById('togglePassword'); // Show/Hide button
const icon = document.getElementById('toggleIcon'); // Eye icon

toggleBtn.addEventListener('click', () => {
  const show = passwordInput.type === 'password'; // Check current type
  passwordInput.type = show ? 'text' : 'password'; // Switch text/password

  icon.classList.toggle('bi-eye'); // Toggle open eye icon
  icon.classList.toggle('bi-eye-slash'); // Toggle closed eye icon
});
