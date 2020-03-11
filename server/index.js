const express = require('express');
const cors = require('cors');
const monk = require('monk');
// const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/twitter-clone');
db.then(() =>{
  console.log("connection success");
}).catch((e)=>{
  console.error("Error !",e);
});
const posts = db.get('posts');
// const filter = new Filter();
// filter.clean(string)

app.enable('trust proxy');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Yuhh!'
  })
});

app.get('/posts', (req, res, next) => {
  // Destructuring
  let { skip = 0, limit = 5, sort = 'desc' } = req.query;
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 5;

  skip = skip < 0 ? 0 : skip;
  limit = Math.min(50, Math.max(1, limit));

  Promise.all([
    posts
      .count(),
    posts
      .find({}, {
        skip,
        limit,
        sort: {
          created: sort === 'desc' ? -1 : 1
        }
      })
  ])
    .then(([ total, posts ]) => {
      res.json({
        posts,
        meta: {
          total,
          skip,
          limit,
          has_more: total - (skip + limit) > 0
        }
      });
    }).catch(next);
})

function isValidPost(post) {
  return post.name && post.name.toString().trim() != '' &&
    post.handle && post.handle.toString().trim() != '' &&
    post.message && post.message.toString().trim() != '';
}

app.use(rateLimit({
  windowMs: 30 * 1000, // 30 Seconds
  max: 1
}))

const createPost = (req, res, next) => {
  if(isValidPost(req.body)) {
    // insert into db..
    const post = {
      name: req.body.name.toString(),
      handle: req.body.handle.toString(),
      message: req.body.message.toString(),
      profilePic: req.body.profilePic,
      created: new Date()
    }

    posts
      .insert(post)
      .then(createdPost => {
        res.json(createdPost);
      }).catch(next);
  } else {
    res.status(422);
    res.json({
      error: 'Name and Message are required!'
    });
  }
}

app.post('/posts', createPost);

app.listen(5000, () => {
  console.log('Listening on http://localhost:5000');
});

module.exports = app