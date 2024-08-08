import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Homepage,
  Login,
  Register,
  AccountDetail,
  UserList,
  ProductList,
  ProductEdit,
  ProductAdd,
  ProductDetail,
  CartProduct,
  CheckoutProduct,
  TransactionList,
  TransactionDetail,
  ReviewList,
  ReviewAdd,
  ReviewDetail,
  SearchPage,
  ProductReviewList,
} from "./pages";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Users */}
        <Route path="/" element={<Homepage />} />
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/register" element={<Register />} />
        <Route path="/account/user" element={<AccountDetail />} />
        <Route path="/account/user-list" element={<UserList />} />
        {/* Products */}
        <Route path="/account/product" element={<ProductList />} />
        <Route path="/account/edit-product/:id" element={<ProductEdit />} />
        <Route path="/account/add-product" element={<ProductAdd />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/product/review/:id" element={<ProductReviewList />} />
        <Route path="/product" element={<SearchPage />} />
        {/* Carts */}
        <Route path="/cart" element={<CartProduct />} />
        <Route path="/checkout" element={<CheckoutProduct />} />
        {/* Transactions */}
        <Route path="/transaction" element={<TransactionList />} />
        <Route path="/transaction/:id" element={<TransactionDetail />} />
        {/* Reviews */}
        <Route path="/review" element={<ReviewList />} />
        <Route path="/review/add/:id" element={<ReviewAdd />} />
        <Route path="/review/:id" element={<ReviewDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
