// Cambiar de pestaña entre secretario y administrador
const secretarioTab = document.getElementById('secretarioTab');
const administradorTab = document.getElementById('administradorTab');

secretarioTab.addEventListener('click', () => {
  secretarioTab.classList.add('active');
  administradorTab.classList.remove('active');
});

administradorTab.addEventListener('click', () => {
  administradorTab.classList.add('active');
  secretarioTab.classList.remove('active');
});

// Envío del formulario
const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    errorMsg.textContent = 'Por favor, ingresa usuario y contraseña.';
    return;
  }

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!data.success) {
      errorMsg.textContent = data.error || 'Usuario o contraseña incorrectos.';
    } else {
      if (data.role === 'admin') {
        window.location.href = '/admin';
      } else if (data.role === 'secretary') {
        window.location.href = '/secretario';
      } else {
        errorMsg.textContent = 'Rol no reconocido. Contacta al administrador.';
      }
    }
  } catch (err) {
    errorMsg.textContent = 'Error al conectar con el servidor.';
    console.error(err);
  }
});
