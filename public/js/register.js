document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const hasNumber = /\d/.test(password);

  if (username.length < 6 || password.length < 6 || !hasNumber) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Input',
      text: 'Password must have at least 6 characters and include at least 1 number.'
    });
    return;
  }

  // Show loading
  Swal.fire({
    title: 'Creating account...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Account created!',
        text: data.message || 'You can now log in.',
        showConfirmButton: false,
        timer: 1500
      });
      setTimeout(() => (window.location.href = '/'), 1600);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Registration failed',
        text: data.message || 'Please try again.'
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Server error',
      text: 'Could not connect to the server.'
    });
  }
});

// show toggle
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  const icon = document.getElementById('toggleIcon');

  toggleBtn.addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    icon.classList.toggle('bi-eye');
    icon.classList.toggle('bi-eye-slash');
  });
