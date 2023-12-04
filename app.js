// app.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Himanshu@?02',
  database: 'himabase',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
    // Create a table to store favorites if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year VARCHAR(10),
        type VARCHAR(20),
        poster VARCHAR(255)
      )
    `;
    db.query(createTableQuery, (createTableErr) => {
      if (createTableErr) {
        console.error('Error creating table:', createTableErr);
      } else {
        console.log('Table created successfully');
      }
    });
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/search', async (req, res) => {
  const searchTerm = req.body.searchTerm;
  const apiKey = '37607d8e';
  const omdbApiUrl = 'http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}';

  try {
    const response = await axios.get(omdbApiUrl);
    if (response.data.Error) {
      console.error('OMDB API Error:', response.data.Error);
      res.status(500).send('OMDB API Error: ' + response.data.Error);
    } else {
      const movies = response.data.Search || [];
      res.render('search', { movies });
    }
  } catch (error) {
    console.error('Error fetching data from OMDB:', error.message);
    res.status(500).send('Internal Server Error');
  }
  
});

app.post('/favorite', (req, res) => {
  const { title, year, type, poster } = req.body;

  const insertFavoriteQuery = `
    INSERT INTO favorites (title, year, type, poster)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertFavoriteQuery, [title, year, type, poster], (err, results) => {
    if (err) {
      console.error('Error inserting favorite:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/favorites');
    }
  });
});

app.get('/favorites', (req, res) => {
  const selectFavoritesQuery = 'SELECT * FROM favorites';

  db.query(selectFavoritesQuery, (err, results) => {
    if (err) {
      console.error('Error selecting favorites:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const favorites = results || [];
      res.render('favorites', { favorites });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
