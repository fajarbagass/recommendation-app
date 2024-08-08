import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";
import { GetCurrentUser, FormatRupiah } from "../utils";

function CheckoutProduct() {
  const [checkoutData, setCheckoutData] = useState([]);
  const user = GetCurrentUser();
  const navigate = useNavigate();

  const fetchCheckoutData = useCallback(async () => {
    const purchasedItem = localStorage.getItem("purchasedItem");
    const orderItems = localStorage.getItem("orderItems");

    if (purchasedItem) {
      const [variant, quantity] = purchasedItem.split(",").map(Number);
      const capturedData = {
        variant: variant,
        quantity: quantity,
      };
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/variant/${capturedData.variant}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const dataCheckout = [
          {
            id: 1,
            User: user,
            Variant: response.data.data,
            quantity: quantity,
          },
        ];
        setCheckoutData(dataCheckout);
      } catch (error) {
        console.error("Error fetching variant data: ", error);
      }
    } else if (orderItems) {
      const cartId = orderItems.split(",").map(Number);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/auth/cart/user`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const cartData = response.data.data;
        const dataCheckout = [];

        cartData.forEach((data) => {
          cartId.forEach((id) => {
            if (data.id === id) {
              dataCheckout.push(data);
            }
          });
        });
        setCheckoutData(dataCheckout);
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
    }
  }, [user]);

  const handleOrder = async (e) => {
    e.preventDefault();

    const orderCode = "P" + Math.floor(1000000 + Math.random() * 9000000);
    const totalPayment = checkoutData.reduce(
      (total, data) => total + data.Variant.price * data.quantity,
      0
    );

    try {
      const orderResponse = await axios.post(
        `http://localhost:8000/api/v1/auth/order`,
        {
          code: orderCode,
          user_id: user.id,
          status: "Menunggu Pembayaran",
          total: totalPayment,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const orderId = orderResponse.data.data.id;
      const orderItemsRequests = checkoutData.map((item) => {
        const dataItem = {
          order_id: orderId,
          variant_id: item.Variant.id,
          quantity: item.quantity,
          price: item.Variant.price * item.quantity,
        };
        return axios.post(
          `http://localhost:8000/api/v1/auth/order-item`,
          dataItem,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
      });

      await Promise.all(orderItemsRequests);
      const cartResponse = await axios.get(
        `http://localhost:8000/api/v1/auth/cart/user`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      const cartDeletionRequests = cartResponse.data.data
        .filter((cart) => checkoutData.some((item) => item.id === cart.id))
        .map((cart) =>
          axios.delete(`http://localhost:8000/api/v1/auth/cart/${cart.id}`, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
        );

      await Promise.all(cartDeletionRequests);
      localStorage.removeItem("purchasedItem");
      localStorage.removeItem("orderItems");

      navigate("/");
      alert("Berhasil !\nPesanan berhasil dibuat.");
    } catch (error) {
      console.error("Error during order processing: ", error);
      alert("Terjadi kesalahan. Mohon coba lagi.");
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  return (
    <>
      <NavbarLabel label={"CHECKOUT"} />
      <div className="container cart-content pb-3">
        <div className="pb-3">
          <div className="d-flex gap-2 align-items-center mb-2 border-top border-bottom p-2 bg-light">
            <img
              src={process.env.PUBLIC_URL + "/assets/location-icon.svg"}
              alt="location-icon"
              className="icons"
            />
            <label className="text-label">Alamat Pengiriman</label>
          </div>
          <div className="ms-2 ps-4">
            <label className="text-normal">
              {user.name}&nbsp;|&nbsp;{user.phone_number}
              <br />
              {user.address}
            </label>
          </div>
        </div>
        <div className="pb-3">
          <div className="d-flex gap-2 align-items-center mb-2 border-top border-bottom p-2 bg-light">
            <img
              src={process.env.PUBLIC_URL + "/assets/order-item-icon.svg"}
              alt="order-item-icon"
              className="icons"
            />
            <label className="text-label">Daftar produk</label>
          </div>
          <div>
            {checkoutData ? (
              <>
                {checkoutData.map((data) => {
                  return (
                    <div
                      key={data.id}
                      className="cart-list mb-2 gap-2 border-bottom border-top bg-light p-2"
                    >
                      <div className="square-img-list">
                        {data.Variant.Product.picture ? (
                          <img
                            src={`http://localhost:8000/public/products/${data.Variant.Product.picture}`}
                            alt={data.Variant.Product.picture}
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
                      <div className="w-100 d-flex flex-column justify-content-between">
                        <div className="d-flex flex-column">
                          <label className="text-label">
                            {data.Variant.Product.model}
                          </label>
                          <label className="text-normal">
                            {data.Variant.ram}/{data.Variant.storage},&nbsp;
                            {data.Variant.color}
                          </label>
                          <label className="text-normal">
                            <FormatRupiah number={data.Variant.price} />
                          </label>
                        </div>
                        <div className="text-end">
                          <label className="text-normal">
                            x{data.quantity}
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : null}
          </div>
        </div>
        <div>
          <div className="d-flex gap-2 align-items-center mb-2 border-top border-bottom p-2 bg-light">
            <img
              src={process.env.PUBLIC_URL + "/assets/payment-icon.svg"}
              alt="payment-icon"
              className="icons"
            />
            <label className="text-label">Metode Pembayaran</label>
          </div>
          <div className="ms-2 ps-4">
            <label className="text-label">Transfer Bank</label>
            <p className="text-normal">Bank BRI - 00000001</p>
          </div>
        </div>
      </div>
      <div className="cart-summary">
        <div className="container py-2">
          <div className="d-flex justify-content-between align-items-center">
            <label className="text-title">Rincian Pembayaran</label>
            <button
              type="button"
              onClick={handleOrder}
              className="btn btn-dark text-btn"
            >
              Buat Pesanan
            </button>
          </div>
          <div>
            <label className="text-label w-25">Total Pesanan</label>
            <label className="text-normal">
              :&nbsp;&nbsp;
              {checkoutData ? (
                <>
                  {checkoutData.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
                </>
              ) : null}
              &nbsp; produk
            </label>
          </div>
          <div>
            <label className="text-label w-25">Total Pembayaran</label>
            <label className="text-normal">
              :&nbsp;&nbsp;
              {checkoutData ? (
                <>
                  <FormatRupiah
                    number={checkoutData.reduce(
                      (total, data) =>
                        total + data.Variant.price * data.quantity,
                      0
                    )}
                  />
                </>
              ) : null}
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckoutProduct;
