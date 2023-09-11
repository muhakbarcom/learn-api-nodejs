require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const database = require("./database");
const UserService = require("./services/userService");
const userRouter = require("./routes/userRouter");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/"); // Uploads will be stored in the 'assets/uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const filename = file.fieldname + "-" + uniqueSuffix + fileExtension;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Create a UserService instance with the database connection
const userService = new UserService(database);

// Use the userRouter as middleware
app.use("/api/users", userRouter(userService, upload));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
