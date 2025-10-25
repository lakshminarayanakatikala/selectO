const dotenv = require("dotenv"); 
const connectDB = require("./db/db.js")
dotenv.config(); 
connectDB();
const express = require("express");
const productRoute = require("./routes/productRoutes.js")
const sellerAuthRoutes = require("./routes/sellerAuthRoutes.js")
const app = express();
const port = process.env.PORT; 
 
// Middlewares
app.use(express.json());   
app.use(express.urlencoded({extended : true}))

// coustom Middlewares  

app.use("/api/seller/products" , productRoute );
app.use("/api/seller/auth", sellerAuthRoutes);
 
// Test route 
app.get("/", (req, res) => {
  res.send("Server is working.."); 
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
