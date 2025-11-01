const dotenv = require("dotenv"); 
dotenv.config(); 
const connectDB = require("./db/db.js")
// require("./jobs/stockChecker.js"); // starts the cron job automatically

connectDB();
const express = require("express");
const path = require("path")
const cors = require('cors')
const productRoute = require("./routes/productRoutes.js")
const sellerAuthRoutes = require("./routes/sellerAuthRoutes.js")
const orderRoutes = require("./routes/orderRoutes.js")
const userRoutes = require("./routes/userRoutes.js")
// const notificationRoutes = require("./routes/notificationRoutes");
const cartRoutes = require("./routes/cartRoutes");
const {apiList} = require('./views/apis.js');
const showProductsRoute = require("./routes/showProducts.js");
const categoryRouter  = require("./routes/categoryRoutes.js");
const searchRouter = require("./routes/searchRoutes.js");

const app = express();
const port = process.env.PORT;   

// Set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
 
// Middlewares
app.use(cors())
app.use(express.json());   
app.use(express.urlencoded({extended : true}))

// coustom Middlewares  

app.use("/api/seller/products" , productRoute );
app.use("/api/seller/auth", sellerAuthRoutes);
app.use("/api/seller/orders", orderRoutes);
// app.use("/api/notifications", notificationRoutes);

//user middlewares   
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/apis" , showProductsRoute)

// search functionality

app.use('/api/search',searchRouter)

//admin middlewares
app.use('/api/admin' , categoryRouter)


// Test route 
app.get("/", (req, res) => {
  res.render("root" ,{apiList})
  // res.send("Server is working.."); 

});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
