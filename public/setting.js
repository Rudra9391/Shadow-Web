const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const deleteUser= document.getElementById('delete')
console.log(username);
const deleteMe=()=>{
  fetch(`https://shadow-web.onrender.com/delete/${username}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ username:username}),
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    console.log('User deleted successfully');
    alert(`user : ${username} deteted successfully `)
    location.href="./login.html" ;
  })
  .catch(error => {
    console.error('Error deleting user:', error);
  });
   
}
