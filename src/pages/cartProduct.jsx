import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components";
import { FormatRupiah } from "../utils";

function CartProduct() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const getCartUser = async () => {
    await axios
      .get(`http://localhost:8000/api/v1/auth/cart/user`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setCartItems(res.data.data);
      });
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(cartItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItems((prevSelectedItems) => {
      if (
        prevSelectedItems.some((selectedItem) => selectedItem.id === item.id)
      ) {
        return prevSelectedItems.filter(
          (selectedItem) => selectedItem.id !== item.id
        );
      } else {
        return [...prevSelectedItems, item];
      }
    });
  };

  const handleDeleteCartItem = (id) => {
    axios.delete(`http://localhost:8000/api/v1/auth/cart/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    alert("Berhasil !\nData keranjang berhasil dihapus.");
    window.location.reload();
  };

  const handleAddQuantity = (item) => {
    if (item.quantity <= item.Variant.stock - 1) {
      const updatedItem = {
        quantity: item.quantity + 1,
      };
      axios.put(
        `http://localhost:8000/api/v1/auth/cart/${item.id}`,
        updatedItem,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
    }
  };

  const handleSubtractQuantity = (item) => {
    if (item.quantity >= 2) {
      const updatedItem = {
        quantity: item.quantity - 1,
      };
      axios.put(
        `http://localhost:8000/api/v1/auth/cart/${item.id}`,
        updatedItem,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
    }
  };

  const handleCheckout = (selectedItems) => {
    if (selectedItems.length !== 0) {
      const orderItems = selectedItems.map(({ id }) => id);
      localStorage.setItem("orderItems", orderItems);
      localStorage.removeItem("purchasedItem");
      navigate("/checkout");
    } else {
      alert("Peringatan !\nPilih produk yang ingin anda beli.");
      localStorage.removeItem("orderItems");
      localStorage.removeItem("purchasedItem");
    }
  };

  useEffect(() => {
    getCartUser();
    if (cartItems.length === selectedItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, cartItems]);

  return (
    <div className="bg-light" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="container py-3">
        <label className="text-title">Keranjang Saya</label>
        <div className="cart-content">
          <div className="cart-list p-2 mb-2">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <label className="text-label">Pilih semua</label>
            </div>
          </div>
          {
            (cartItems.sort((a, b) => a.id - b.id),
            cartItems.map((item) => {
              return (
                <div key={item.id} className="cart-list gap-2 p-2 mb-2">
                  {item.Variant.Product ? (
                    <>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedItems.some(
                            (selectedItem) => selectedItem.id === item.id
                          )}
                          onChange={() => handleSelectItem(item)}
                        />
                        <div className="square-img-list">
                          {item.Variant.Product.picture ? (
                            <img
                              src={`http://localhost:8000/public/products/${item.Variant.Product.picture}`}
                              alt={item.Variant.Product.picture}
                              className="img-list"
                            />
                          ) : (
                            <img
                              src={
                                process.env.PUBLIC_URL +
                                "/assets/no-img-product.jpg"
                              }
                              alt="no-img-product"
                              className="img-list"
                            />
                          )}
                        </div>
                      </div>
                      <div className="w-100 d-flex flex-column justify-content-between">
                        <div className="d-flex flex-column gap-1">
                          <label className="text-label">
                            {item.Variant.Product.model}
                          </label>
                          <label className="text-normal text-secondary">
                            {item.Variant.ram}/{item.Variant.storage},&nbsp;
                            {item.Variant.color}
                          </label>
                          <label className="text-label">
                            <FormatRupiah number={item.Variant.price} />
                          </label>
                        </div>
                        <div className="d-flex justify-content-end p-2 gap-2">
                          <div
                            role="button"
                            onClick={() => handleDeleteCartItem(item.id)}
                          >
                            <img
                              src={
                                process.env.PUBLIC_URL +
                                "/assets/trash-icon.svg"
                              }
                              alt="trash-icon"
                              className="icons"
                            />
                          </div>
                          <div className="d-flex">
                            <div
                              role="button"
                              onClick={() => handleSubtractQuantity(item)}
                            >
                              <img
                                src={
                                  process.env.PUBLIC_URL +
                                  "/assets/minus-btn-icon.svg"
                                }
                                alt="minus-btn-icon"
                                className="icons"
                              />
                            </div>
                            <div
                              className="text-center"
                              style={{ width: "76px" }}
                            >
                              {item.quantity}
                            </div>
                            <div
                              role="button"
                              onClick={() => handleAddQuantity(item)}
                            >
                              <img
                                src={
                                  process.env.PUBLIC_URL +
                                  "/assets/plus-btn-icon.svg"
                                }
                                alt="plus-btn-icon"
                                className="icons"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              );
            }))
          }
        </div>
      </div>
      <div className="cart-summary">
        <div className="container py-2">
          <div className="d-flex justify-content-between align-items-center">
            <label className="text-title">Ringkasan Belanja</label>
            <button
              type="button"
              onClick={() => handleCheckout(selectedItems)}
              className="btn btn-dark text-btn"
            >
              Checkout
            </button>
          </div>
          <div>
            <label className="text-label w-25">Total Produk</label>
            <label className="text-normal">
              :&nbsp;&nbsp;
              {selectedItems.reduce((total, item) => total + item.quantity, 0)}
              &nbsp; produk
            </label>
          </div>
          <div>
            <label className="text-label w-25">Total Harga</label>
            <label className="text-normal">
              :&nbsp;&nbsp;
              <FormatRupiah
                number={selectedItems.reduce(
                  (total, item) => total + item.Variant.price * item.quantity,
                  0
                )}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartProduct;
