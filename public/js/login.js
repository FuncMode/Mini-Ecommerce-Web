// public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username.length < 6 || password.length < 6) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid input',
      text: 'Username and password must be at least 6 characters.'
    });
    return;
  }

  Swal.fire({
    title: 'Logging in...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    Swal.close();

    if (res.ok) {
      localStorage.setItem("username", data.username || username);

      Swal.fire({
        icon: 'success',
        title: 'Login successful!',
        text: `Welcome, ${data.username || username}!`,
        showConfirmButton: false,
        timer: 1000
      });

      setTimeout(() => (window.location.href = '/main'), 1100);
      return;
    }

    if (res.status === 404 && data.message === 'Username not found') {
      Swal.fire({ icon: 'error', title: 'Username not found', text: 'Please register first.' });
      return;
    }

    if (res.status === 401 && data.message === 'Wrong password') {
      Swal.fire({ icon: 'error', title: 'Wrong password', text: 'Please check your password.' });
      return;
    }

    Swal.fire({ icon: 'error', title: 'Login failed', text: data.message || 'Invalid credentials' });

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

// show toggle
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  const icon = document.getElementById('toggleIcon');

  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    icon.classList.toggle('bi-eye');
    icon.classList.toggle('bi-eye-slash');
  });
