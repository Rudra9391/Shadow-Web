document.getElementById('register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    fetch('https://shadow-web.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        // Redirect to login.html on successful registration
        if (data.message === 'User registered successfully') {
          location.href = 'login.html';
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Failed to register user');
      });
  });
  