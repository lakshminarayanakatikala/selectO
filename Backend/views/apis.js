exports.apiList = [
  // Product APIs
  {
    method: "GET",
    path: "/api/seller/products",
    desc: "Get all products seller",
  },
  { method: "POST", path: "/api/seller/products/add", desc: "Add new product" },
  {
    method: "POST",
    path: "/api/seller/products/upload",
    desc: "Upload xlsl sheet",
  },
  {
    method: "DELETE",
    path: "/api/seller/products/:id",
    desc: "Delete product",
  },
  { method: "PUT", path: "/api/seller/products/:id", desc: "Update product" },
  {
    method: "PATCH",
    path: "/api/seller/products/stock/:id",
    desc: "Toggle product stock status",
  },
  {
    method: "PATCH",
    path: "/api/seller/products/discount",
    desc: "Apply discount to all products",
  },
  {
    method: "PATCH",
    path: "/api/seller/products/restore-prices",
    desc: "Restore original prices for all products",
  },
  {
    method: "PATCH",
    path: "/api/seller/products/category/discount",
    desc: "Apply category-wise discount",
  },
  {
    method: "PATCH",
    path: "/api/seller/products/category/remove-discount",
    desc: "Remove category-wise discount",
  },

  // Seller Auth APIs
  {
    method: "POST",
    path: "/api/seller/auth/register",
    desc: "Register new seller",
  },
  { method: "POST", path: "/api/seller/auth/login", desc: "Seller login" },
  { method: "GET", path: "/api/seller/auth/", desc: "Get all sellers" },
  {
    method: "PATCH",
    path: "/api/seller/auth/status",
    desc: "Toggle seller online status",
  },

  // Seller Orders APIs
  {
    method: "POST",
    path: "/api/seller/orders/create",
    desc: "user create new order ",
  },
  {
    method: "GET",
    path: "/api/seller/orders/all",
    desc: "Get all seller orders ",
  },
  {
    method: "GET",
    path: "/api/seller/orders/pending",
    desc: "Get pending seller orders",
  },
  {
    method: "GET",
    path: "/api/seller/orders/delivered",
    desc: "Get delivered orders",
  },
  {
    method: "PATCH",
    path: "/api/seller/orders/status/:id",
    desc: "Update order status",
  },

  // Notifications
  {
    method: "GET",
    path: "/api/notifications",
    desc: "Get all notifications (present working)",
  },

  // User APIs
  { method: "POST", path: "/api/user/register", desc: "Register new user" },
  { method: "POST", path: "/api/user/login", desc: "User login" },
  {
    method: "POST",
    path: "/api/user/toggle",
    desc: "Toggle product as favorite",
  },
  { method: "GET", path: "/api/user/", desc: "Get all favorites" },
  {
    method: "GET",
    path: "/api/user/products/bachelor-filter?maxPrice=100&category=Fruits",
    desc: "Get filtered products (bachelor) here category is optional if need add it other wise no",
  },
  {
    method: "GET",
    path: "/api/user/products/:id",
    desc: "Get favorites for specific product",
  },
  {
    method: "GET",
    path: "/api/user/singleproduct/:id",
    desc: "Get single product details",
  },
  {
    method: "GET",
    path: "/api/user/products",
    desc: "Get all products all seller's",
  },
  {
    method: "GET",
    path: "/api/user/products/offers/exclusive?productId='1234567890'",
    desc: "Get exclusive offers based on discount product id is helpful showing single product it is optional",
  },
  {
    method: "GET",
    path: "/api/user/categories?search=fruits",
    desc: "Get all categories query is optional",
  },
  {
    method: "GET",
    path: "/api/user/category/:category",
    desc: "Get products by category",
  },

  //Cart APIs
  {
    method: "POST",
    path: "/api/cart/add",
    desc: "Add product to cart  {'productId':'id', quantity:1}",
  },
  {
    method: "POST",
    path: "/api/cart/remove",
    desc: "Decrease item quantity in cart {'productId':'id', decreaseBy:1}",
  },
  { method: "GET", path: "/api/cart/", desc: "Get user cart" },
  {
    method: "DELETE",
    path: "/api/cart/delete",
    desc: "Remove item from cart { 'productId':'id' }",
  },
  { method: "DELETE", path: "/api/cart/clear", desc: "Clear user's cart" },

  // show sellers and related products
  { method: "GET", path: "/apis/sellers", desc: "show all sellers" },
  {
    method: "GET",
    path: "/apis/:sellerId/products",
    desc: "show the seller products",
  },
  {
    method: "GET",
    path: "/apis/:sellerId/categories",
    desc: "show the particular seller categories ",
  },
  {
    method: "GET",
    path: "/sellers/:sellerId/products/:category",
    desc: "show the particular categories like veg ,fruits",
  },
  {
    method: "GET",
    path: "/api/seller/products/best-selling?productId=6905a99f541acd02982db4b1",
    desc: "get the best selling products product id is helpful showing single product it is optional if need it add other wise no",
  },
  {
    method: "POST",
    path: "/api/seller/products/best-selling",
    desc: "add and remove the best-selling products in list",
  },
  {
    method: "GET",
    path: "/api/search/seller/:sellerId/search?query=apple",
    desc: "search the products for same seller it also helpful for suggitions",
  },
  {
    method: "GET",
    path: "/api/seller/products/:productId/relevant",
    desc: "get relevent products of the seller",
  },
  {
    method: "GET",
    path: "/apis/seller-page/:sellerId?category=Fruits",
    desc: "seller main page with categories",
  },
  {
  method: "POST",
  path: "/api/user/send-otp",
  desc: "Send OTP to user’s mobile number for authentication",
},
{
  method: "POST",
  path: "/api/user/verify-otp",
  desc: "Verify OTP entered by user and check if user already exists",
},
{
  method: "POST",
  path: "/api/user/register",
  desc: "Register new user after OTP verification (collects name & email)",
},
{
  method: "GET",
  path: "/api/search/universalSearch?q=vegetables (or apple etc..)",
  desc: "this universal search",
},
{
  method: "GET",
  path: "/api/seller/orders/complete-orders",
  desc: "get user orders",
},
{
  method: "GET",
  path: "/api/user/profile",
  desc: "get user details",
},
{
  method: "PUT",
  path: "/api/user/profile",
  desc: "edit user details",
},
{
  method: "GET",
  path: "/api/user/:sellerId/product/:productId?category=Fruits",
  desc: "seller single product category is optinal if we not give automatically take product category",
},

];
