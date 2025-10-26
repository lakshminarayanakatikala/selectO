const dotenv = require("dotenv"); 
const connectDB = require("./db/db.js")
dotenv.config(); 
connectDB();
const express = require("express");
const productRoute = require("./routes/productRoutes.js")
const sellerAuthRoutes = require("./routes/sellerAuthRoutes.js")
const orderRoutes = require("./routes/orderRoutes.js")
const userRoutes = require("./routes/userRoutes.js")
const app = express();
const port = process.env.PORT;   
 
// Middlewares
app.use(express.json());   
app.use(express.urlencoded({extended : true}))

// coustom Middlewares  

app.use("/api/seller/products" , productRoute );
app.use("/api/seller/auth", sellerAuthRoutes);
app.use("/api/seller/orders", orderRoutes);

//user middlewares   
app.use("/api/user", userRoutes);
 
// Test route 
app.get("/", (req, res) => {
  res.send("Server is working.."); 
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
