// server/index.js

const express = require("express");
const mysql = require("mysql2")
const dotenv = require("dotenv")

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();
const bcrypt = require("bcrypt")
app.use(express.json())

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});




app.get("/api", (req, res) => {
    res.json({ message: "Hello from daddy!" });
  });


app.get("/api/users", (req,res) =>{
  const sql = "SELECT * FROM users";
  db.query(sql, (err,results) => {
    if (err){
      console.error(err);
      res.status(500).send("error fetching users");
    }
    else{
      res.json(results)
    }
  });
});

// Signup Route
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields (name, email, password) are required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error registering the user." });
      }
      res.status(201).json({ message: "User registered successfully." });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Login Route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({ message: "Both email and password are required." });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error logging in." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = results[0];

    // Compare hashed password
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.status(200).json({ message: "Login successful." });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
