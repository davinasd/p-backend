// index.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;


mongoose.connect(
  "mongodb+srv://a:a@cluster0.fuios2w.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "DB", 
  }
);


app.use(bodyParser.json());


const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
