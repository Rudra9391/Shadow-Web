const usernameElement = document.getElementById('username');
const createPostForm = document.getElementById('createPostForm');
const userPostsContainer = document.getElementById('userPosts');
const trending = document.getElementsByClassName('.div1');
const setting=document.getElementById('setting');
const home = document.getElementById('home');
const tred = document.getElementById('Trending')
const tredLink = document.getElementById('trendPage');
const useLink = document.getElementById('UserPage')
useLink.style.display="none";
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
usernameElement.textContent = username;

fetchUserPosts();
allpost()
tredLink.addEventListener('click',()=>{
  tred.style.display="block";
  useLink.style.display="none";
})
home.addEventListener('click',()=>{
  tred.style.display="none";
  useLink.style.display="block";
})
// Event listener for create post form submission
setting.addEventListener('click',(e)=>{
  location.href = `setting.html?username=${username}`;
})
createPostForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const topic = document.getElementById('topic').value;
  const post = document.getElementById('post').value;

  // Send post data to the server
  fetch('https://shadow-web.onrender.com/posts/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, post, user: username }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Clear form fields
      document.getElementById('topic').value = '';
      document.getElementById('post').value = '';

      // Fetch and display user's posts
      fetchUserPosts();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

function fetchUserPosts() {
  fetch(`https://shadow-web.onrender.com/posts/user/${username}`)
    .then((response) => response.json())
    .then((data) => {
      userPostsContainer.innerHTML = '';

      data.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
        <div class="form-container">
  <h3 style="color: #333; font-size: 24px; margin-bottom: 10px;">User: ${post.user.username}</h3>
  <h3 class="topic">Topic: ${post.topic}</h3><p>
  <span><b>Post : </b> </span>
  ${post.post}</p>
  <button class="likeBtn">Like (${post.likes})</button>
  <button class="commentBtn">Comment</button>
  <div class="comments">
    ${getCommentsHTML(post.comments)}
  </div>
  <button class="Delete" >
        Delete
  </button>    
  <hr>
</div>

      

        `;

        userPostsContainer.appendChild(postElement);

        // Event listener for like button
        const likeBtn = postElement.querySelector('.likeBtn');
        likeBtn.addEventListener('click', () => {
          likePost(post._id);
        });

        // Event listener for comment button
        const Deletebtn=postElement.querySelector('.Delete')
        Deletebtn.addEventListener('click',async()=>{
          deletePost(post._id);
        })
        const commentBtn = postElement.querySelector('.commentBtn');
        commentBtn.addEventListener('click', () => {
          const comment = prompt('Enter your comment:');
          if (comment) {
            addComment(post._id, comment);
          }
        });
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Function to generate HTML for comment
// Function to like a post
function likePost(postId) {
  const user = username;
  fetch(`https://shadow-web.onrender.com/posts/like/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Refresh user posts
      fetchUserPosts();
      allpost();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Function to add a comment to a post
function addComment(postId, comment) {
  const user = username;
  fetch(`https://shadow-web.onrender.com/posts/comment/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user, comment }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Refresh user posts
      fetchUserPosts();
      allpost()
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
const postsContainer = document.getElementById('postsContainer');

// Fetch all posts
function allpost() {
  fetch('https://shadow-web.onrender.com/posts/all')
    .then((response) => response.json())
    .then((posts) => {
      postsContainer.innerHTML = '';
      posts.sort((b, a) => (a.likes + a.comments.length) - (b.likes + b.comments.length));
      posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
        <div class="form-container">
  <h3 style="color: #333; font-size: 24px; margin-bottom: 10px;">User: ${post.user.username}</h3>
  <h3 class="topic">Topic: ${post.topic}</h3><p>
  <span><b>Post : </b> </span>
  ${post.post}</p>
  <button class="likeBtn">Like (${post.likes})</button>
  <button class="commentBtn">Comment</button>
  <div class="comments">
    ${getCommentsHTML(post.comments)}
  </div>
  <hr>
</div>
      `;

        postsContainer.appendChild(postElement);

        // Event listener for like button
        const likeBtn = postElement.querySelector('.likeBtn');
        likeBtn.addEventListener('click', () => {
          likePost(post._id);
        });

        // Event listener for comment button
        const commentBtn = postElement.querySelector('.commentBtn');
        commentBtn.addEventListener('click', () => {
          const postId = post._id;
          const comment = prompt('Enter your comment:');
          if (comment) {
            addComment(postId, comment);
          }
        });
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Function to generate HTML for comments
function getCommentsHTML(comments) {
  let html = '';
  comments.forEach((comment) => {
    html += `<p><span>${comment.user.username}:</span> ${comment.comment}</p>`;
  });
  return html;
}

// Function to like a post
function likePost(postId) {
  const user = username;
  fetch(`https://shadow-web.onrender.com/posts/like/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Refresh user posts
      fetchUserPosts();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Function to add a comment to a post
function addComment(postId, comment) {
  const user = username;
  fetch(`https://shadow-web.onrender.com/posts/comment/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user, comment }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Refresh user posts
      fetchUserPosts();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Fetch and display user's posts on page load
const deletePost= async(postId)=>{
  fetch(`https://shadow-web.onrender.com/posts/${postId}`, {
  method: 'DELETE',
})
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to delete post');
    }
  })
  .then(data => {
    alert('Post deleted successfully');
    location.reload();
    // Perform any additional actions or UI updates as needed
  })
  .catch(error => {
    console.error('Error deleting post:', error);
    alert('Failed to delete post');
    // Handle any network errors or exceptions
  });
}
fetchUserPosts();
allpost()