exports.apiList = [
  // Product APIs
  {
    method: "GET",
    path: "/api/seller/products",
    desc: "Get all products (admin/seller)",
  },
  { method: "POST", path: "/api/seller/products/add", desc: "Add new product" },
  {
    method: "POST",
    path: "/api/seller/products/upload",
    desc: "Upload product image(s)",
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
    desc: "Create new order",
  },
  {
    method: "GET",
    path: "/api/seller/orders/all",
    desc: "Get all seller orders",
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
  { method: "GET", path: "/api/notifications", desc: "Get all notifications" },

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
    path: "/api/user/products/bachelor-filter",
    desc: "Get filtered products (bachelor)",
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
    desc: "Get all products (user)",
  },
  {
    method: "GET",
    path: "/api/user/products/offers/exclusive",
    desc: "Get exclusive offers",
  },
  { method: "GET", path: "/api/user/categories", desc: "Get all categories" },
  {
    method: "GET",
    path: "/api/user/category/:category",
    desc: "Get products by category",
  },

  //Cart APIs
  { method: "POST", path: "/api/cart/add", desc: "Add product to cart" },
  {
    method: "POST",
    path: "/api/cart/remove",
    desc: "Decrease item quantity in cart",
  },
  { method: "GET", path: "/api/cart/", desc: "Get user cart" },
  { method: "DELETE", path: "/api/cart/delete", desc: "Remove item from cart" },
  { method: "DELETE", path: "/api/cart/clear", desc: "Clear user's cart" },
];
