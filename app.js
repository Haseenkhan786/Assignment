const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const port = 3001;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "13062001",
  port: 5432,
});

// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } else {
    console.log("Connected to PostgreSQL database");
    done();
  }
});


app.get("/getdata", (req, res) => {
  pool.query("SELECT * FROM questionbank", (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      res.json(results.rows);
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Define the destination folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/postdata", upload.single("file"), (req, res) => {
  const imageName = req.file.filename;

  const {
    id,
    question,
    option1,
    option2,
    option3,
    option4,
    correctanswer,
  } = req.body;

  const insertQuery =
    "INSERT INTO questionbank (id,question,option1,option2,option3,option4,correctanswer,storeimage) VALUES ($1, $2, $3,$4,$5,$6,$7,$8)";

  pool.query(
    insertQuery,
    [
      id,
      question,
      option1,
      option2,
      option3,
      option4,
      correctanswer,
      imageName,
    ],
    (error, results) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).json(error);
      } else {
        console.log("Data inserted successfully");
        res.json({ message: "Data inserted successfully" });
      
        console.log("Data received:", {
          id,
          question,
          option1,
          option2,
          option3,
          option4,
          correctanswer,
          imageName,
        });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
