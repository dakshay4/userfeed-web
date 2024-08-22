const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 5000;

app.use(express.json()); // Middleware to parse JSON request bodies

app.use('/css', express.static(path.join(__dirname, 'css')));
app.set('view engine', 'ejs');
app.set('views', './views');
app.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 0; // Default to page 1 if no page query
    const size = 3; // Number of posts per page
  
    try {
      const response = await axios.get('http://localhost:8080/posts', {
        params: {
          page,
          size
        }
      });
  
      res.render('index', { posts: response.data, page: page, error: null });
    } catch (error) {
      res.render('index', { posts: [], page, error: 'Error fetching posts' });
    }
  });
  
  app.get('/comments/:postId', async (req, res) => {
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 3;

    try {
        const response = await axios.get(`http://localhost:8080/comments/${postId}`, {
            params: { page, size }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

app.get('/replies/:commentId', async (req, res) => {
    const commentId = req.params.commentId;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 3;

    try {
        const response = await axios.get(`http://localhost:8080/comments/replies/${commentId}`, {
            params: { page, size }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching replies' });
    }
});

app.post('/comments/create', async (req, res) => {
    console.log("Request Body:", req.body);
    const { statement, userId, postId, parentCommentId } = req.body;
    try {
        const response = await axios.post('http://localhost:8080/comments/create', {
            statement,
            userId,
            postId,
            parentCommentId
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error creating reply' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8080/users');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.get('/new-post', async (req, res) => {
    try {
        // Fetch users to populate the dropdown
        const response = await axios.get('http://localhost:8080/users');
        res.render('newPost', { users: response.data , error: null});
    } catch (error) {
        res.render('newPost', { users: [], error: 'Error fetching users' });
    }
});

// Route to handle post submission
app.post('/submit-post', (req, res) => {
    const { statement, userId } = req.body;

    axios.post('http://localhost:8080/posts', {
        statement: statement,
        userId: parseInt(userId, 10)
    })
    .then(response => {
        res.redirect('/'); // Redirect back to the main page after submission
    })
    .catch(error => {
        console.error('Error submitting post:', error);
        res.status(500).send('Failed to submit post');
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
