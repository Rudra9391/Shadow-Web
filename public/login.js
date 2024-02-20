let user;
window.myApp = window.myApp || {};
document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    window.myApp.user=username;
    fetch('https://shadow-web.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        // Redirect to user.html on successful login
        if (data.message === 'Login successful') {
          window.user=data.user;
          location.href = `homepage.html?username=${username}`;
          
        }
      })
      .catch((error) => {
        console.log( error);
        alert('Failed to login');
      });
  });
  