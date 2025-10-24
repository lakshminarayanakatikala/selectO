const express = require("express");
const productRoute = require("./routes/productRoutes.js")
const connectDB = require("./db/db.js")
const dotenv = require("dotenv"); 

const app = express();
const port = process.env.PORT;
dotenv.config(); 
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended : true}))

// coustom Middlewares

// app.use("/api/seller/products" , productRoute );


// Test route
app.get("/", (req, res) => {
  res.send("Server is working..");
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
