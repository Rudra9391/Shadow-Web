import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://om12:om12@cluster0.8uwft4y.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, require: true },
  post: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  comment: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Like = mongoose.model('Like', likeSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to login' });
  }
});

// Delete a post
app.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete related likes
    await Like.deleteMany({ post: postId });

    // Delete related comments
    await Comment.deleteMany({ post: postId });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Create a new post
app.post('/posts/create', async (req, res) => {
  const { post, user, topic } = req.body;

  try {
    const foundUser = await User.findOne({ username: user });
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new post with the retrieved user's ObjectId
    const newPost = new Post({ user: foundUser._id, post, topic });

    const savedPost = await newPost.save();
    res.status(200).json({ message: 'Post created successfully', post: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Like or unlike a post
app.post('/posts/like/:postId', async (req, res) => {
  const { postId } = req.params;
  const { user } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = await User.findOne({ username: user });
    if (!userId) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingLike = await Like.findOneAndDelete({ user: userId._id, post: postId });

    if (existingLike) {
      post.likes--;
    } else {
      const newLike = new Like({ user: userId._id, post: postId });
      await newLike.save();
      post.likes++;
    }

    await post.save();

    res.status(200).json({ message: 'Post like updated successfully', liked: !existingLike });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while updating the post like' });
  }
});

// Comment on a post
app.post('/posts/comment/:postId', async (req, res) => {
  const { postId } = req.params;
  const { comment, user } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const foundUser = await User.findOne({ username: user });
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newComment = new Comment({ user: foundUser._id, post: postId, comment });
    await newComment.save();

    post.comments.push(newComment);
    await post.save();

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Get all posts
app.get('/posts/all', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username'
        }
      });

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Delete a user
app.delete('/delete/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related posts
    await Post.deleteMany({ user: deletedUser._id });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get posts by username
app.get('/posts/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({user: user._id})
      .populate('user', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username'
        }
      });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
});
// Get user by ID
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});



// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
