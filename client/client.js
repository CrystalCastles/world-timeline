const form = document.querySelector('form');
const errorElement = document.querySelector('.error-message');
const loadingElement = document.querySelector('.loading');
const postsElement = document.querySelector('.posts');
const loadMoreElement = document.querySelector('#loadMore');
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/posts' : 'https://worldtimeline-api.now.sh/posts';

let skip = 0;
let limit = 5;
let loading = false;
let finished = false;

// loadingElement.style.display = '';
errorElement.style.display = 'none';

document.addEventListener('scroll', () => {
  const rect = loadMoreElement.getBoundingClientRect();
  if(rect.top < window.innerHeight && !loading && !finished) {
    loadMore();
  }
});

listAllPosts();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get('name');
  const handle = formData.get('handle');
  const message = formData.get('message');
  const profilePic = formData.get('profilePic');

  if(name.trim() && message.trim()) {
    errorElement.style.display = 'none';
    form.style.display = 'none';
    loadingElement.style.display = '';

    const post = {
      name,
      handle,
      message,
      profilePic
    };
    
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(post),
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      if(!response.ok) {
        const contentType = response.headers.get('content-type');
        if(contentType.includes('json')) {
          return response.json().then(error => Promise.reject(error.message));
        } else {
          return response.text().then(message => Promise.reject(message));
        }
      }
    }).then(() => {
      form.reset();
      setTimeout(() => {
        form.style.display = '';
      }, 30000);
      listAllPosts();
    }).catch(errorMessage => {
      form.style.display = '';
      errorElement.textContent = errorMessage;
      errorElement.style.display = '';
      loadingElement.style.display = 'none';
    });
  } else {
    errorElement.textContent = 'Name, handle and message are required!';
    errorElement.style.display = '';
  }
});

function loadMore() {
  skip += limit;
  listAllPosts(false);
}

function listAllPosts(reset = true) {
  loading = true;
  if(reset) {
    postsElement.innerHTML = '';
    skip = 0;
    finished = false;
  }
  fetch(`${API_URL}?skip=${skip}&limit=${limit}`)
    .then(response => response.json())
    .then(result => {
      result.posts.forEach(post => {
        const div = document.createElement('div');
        div.setAttribute('class', 'post-container');

        const name = document.createElement('h3');
        name.textContent = post.name;

        const handle = document.createElement('h4');
        handle.textContent = post.handle;
        
        const message = document.createElement('p');
        message.textContent = post.message;

        const date = document.createElement('small');
        const postedTime = new Date(post.created);
        date.textContent = timeSince(postedTime);

        div.appendChild(name);
        div.appendChild(handle);
        div.appendChild(message);
        div.appendChild(date);

        postsElement.appendChild(div);
      });
      loadingElement.style.display = 'none';
      console.log(result.meta)
      if(!result.meta.has_more) {
        loadMoreElement.style.visibility = 'hidden';
        finished = true;
      } else {
        loadMoreElement.style.visibility = 'visible';
      }
      loading = false;
    });

    function timeSince(date) {
      var seconds = Math.floor((new Date() - date) / 1000);    
      // var interval = Math.floor(seconds / 31536000);
      // if (interval > 1) {
      //   return interval + "y";
      // }
      // interval = Math.floor(seconds / 2592000);
      // if (interval > 1) {
      //   return interval + "m";
      // }
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
        switch(date.getMonth()){
          case 0:
            return "Jan " + date.getDate() + ", " + date.getFullYear();
          case 1:
            return "Feb " + date.getDate() + ", " + date.getFullYear();
          case 2:
            return "Mar " + date.getDate() + ", " + date.getFullYear();
          case 3:
            return "Apr " + date.getDate() + ", " + date.getFullYear();
          case 4:
            return "May " + date.getDate() + ", " + date.getFullYear();
          case 5:
            return "Jun " + date.getDate() + ", " + date.getFullYear();
          case 6:
            return "Jul " + date.getDate() + ", " + date.getFullYear();
          case 7:
            return "Aug " + date.getDate() + ", " + date.getFullYear();
          case 8:
            return "Sep " + date.getDate() + ", " + date.getFullYear();
          case 9:
            return "Oct " + date.getDate() + ", " + date.getFullYear();
          case 10:
            return "Nov " + date.getDate() + ", " + date.getFullYear();
          case 11:
            return "Dec " + date.getDate() + ", " + date.getFullYear();
        }
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + "h";
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + "m";
      }
      return Math.floor(seconds) + "s";
    }
}