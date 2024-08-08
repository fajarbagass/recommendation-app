import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";
import { ModalUploadPayment, ModalEditOrder } from "../components/modals";
import { FormatRupiah, GetCurrentUser, GetAdminData } from "../utils";

function TransactionDetail() {
  const [orderData, setOrderData] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const { phone_number } = GetAdminData();
  const user = GetCurrentUser();
  const { id } = useParams();
  const navigate = useNavigate();

  const getOrderItems = useCallback(async () => {
    const order = await axios.get(
      `http://localhost:8000/api/v1/auth/order/${id}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    setOrderData(order.data.data);

    const orderItem = await axios.get(
      `http://localhost:8000/api/v1/auth/order-item/order/${id}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    setOrderItems(orderItem.data.data);
  }, [id]);

  const openWhatsApp = (number, message) => {
    let phoneNumber = number;
    if (number.startsWith("08")) {
      phoneNumber = "+62" + number.slice(1);
    }
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    getOrderItems();
  }, [getOrderItems]);

  return (
    <>
      <NavbarLabel label={"DETAIL PESANAN"} />
      <div className="container cart-content pb-3">
        <div className="p-2 bg-dark text-white d-flex justify-content-between">
          <label className="text-label">Status Pesanan</label>
          <label className="text-normal">{orderData.status}</label>
        </div>
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
              {orderData ? (
                <>
                  {orderData.User.name}&nbsp;|&nbsp;
                  {orderData.User.phone_number}
                  <br />
                  {orderData.User.address}
                </>
              ) : null}
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
            {orderItems ? (
              <>
                {orderItems.map((data) => {
                  return (
                    <div
                      key={data.id}
                      className="cart-list mb-2 p-2 gap-2 border-bottom border-top bg-light"
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
        <div className="pb-3">
          <div className="d-flex gap-2 align-items-center mb-2 border-top border-bottom p-2 bg-light">
            <img
              src={process.env.PUBLIC_URL + "/assets/calculation-icon.svg"}
              alt="calculation-icon"
              className="icons"
            />
            <label className="text-label">Rincian Pesanan</label>
          </div>
          <div className="ms-2 ps-4">
            <div className="d-flex justify-content-between">
              <label className="text-label">No. Pesanan</label>
              <label className="text-label">{orderData.code}</label>
            </div>
            <div className="d-flex justify-content-between">
              <label className="text-normal">Total Produk</label>
              <label className="text-normal">
                {orderItems.reduce((total, item) => total + item.quantity, 0)}
                &nbsp;produk
              </label>
            </div>
            <div className="d-flex justify-content-between">
              <label className="text-normal">Total pembayaran</label>
              <label className="text-normal">
                {orderData ? <FormatRupiah number={orderData.total} /> : null}
              </label>
            </div>
          </div>
        </div>
        <div className="pb-3">
          <div className="d-flex gap-2 align-items-center mb-2 border-top border-bottom p-2 bg-light">
            <img
              src={process.env.PUBLIC_URL + "/assets/payment-icon.svg"}
              alt="payment-icon"
              className="icons"
            />
            <label className="text-label">Bukti Pembayaran</label>
          </div>
          <div className="ms-4 ps-2">
            <div>
              <label className="text-label">Transfer Bank</label>
              <p className="text-normal">Bank BRI - 00000001</p>
            </div>
            <div className="d-flex justify-content-between ">
              {orderData.proof_image ? (
                <label className="text-normal">{orderData.proof_image}</label>
              ) : (
                <label className="text-normal">
                  Tidak ada bukti pembayaran
                </label>
              )}
              <ModalUploadPayment data={orderData} />
            </div>
          </div>
        </div>
        <div className="pb-3">
          <div className="d-flex gap-2 align-items-center mb-2 border-top border-bottom p-2 bg-light">
            <img
              src={process.env.PUBLIC_URL + "/assets/status-icon.svg"}
              alt="status-icon"
              className="icons"
            />
            <label className="text-label">Status Pesanan</label>
          </div>
          <div className="ms-4 ps-2">
            <label className="text-normal">
              Status pesanan saat ini adalah <b>{orderData.status}</b>.&nbsp;
            </label>
            {orderData.status === "Menunggu Pembayaran" ? (
              <>
                {user.role !== "admin" ? (
                  <>
                    <label className="text-normal">
                      Anda dapat membatalkan pesanan jika tidak ingin
                      melanjutkan proses transaksi.
                    </label>
                    <div className="text-end">
                      <ModalEditOrder order={orderData} />
                    </div>
                  </>
                ) : null}
              </>
            ) : orderData.status === "Menunggu Konfirmasi" ||
              orderData.status === "Dikemas" ||
              orderData.status === "Dalam Pengiriman" ? (
              <>
                {user.role === "admin" ? (
                  <>
                    <label className="text-normal">
                      Ubah status pesanan untuk melanjutkan proses transaksi.
                    </label>
                    <div className="text-end">
                      <ModalEditOrder order={orderData} />
                    </div>
                  </>
                ) : null}
              </>
            ) : orderData.status === "Terkirim" ? (
              <>
                {user.role !== "admin" ? (
                  <>
                    <label className="text-normal">
                      Pastikan pesanan telah anda terima dengan baik dan benar
                      lalu tekan <strong>Pesanan Diterima</strong> untuk
                      menyelesaikan proses transaksi.
                    </label>
                    <div className="text-end">
                      <ModalEditOrder order={orderData} />
                    </div>
                  </>
                ) : null}
              </>
            ) : orderData.status === "Pesanan Diterima" ? (
              <>
                {user.role !== "admin" ? (
                  <>
                    <div className="text-end">
                      <button
                        type="button"
                        className="btn btn-dark text-btn mt-2"
                        onClick={() => navigate("/review")}
                      >
                        Rating Produk
                      </button>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        {user.role !== "admin" ? (
          <div className="mt-2 border-top bg-light">
            <div
              role="button"
              onClick={() =>
                openWhatsApp(
                  phone_number,
                  `No. Pesanan : ${orderData.code}, \nStatus Pesanan : ${orderData.status}, \nHalo!`
                )
              }
              className="d-flex gap-2 align-items-center p-2 border-bottom"
            >
              <img
                src={process.env.PUBLIC_URL + "/assets/chat-icon.svg"}
                alt="chat-icon"
                className="icons"
              />
              <label className="text-label">Chat Penjual &gt;</label>
            </div>
            <div
              role="button"
              onClick={() => navigate("/help")}
              className="d-flex gap-2 align-items-center p-2 border-bottom"
            >
              <img
                src={process.env.PUBLIC_URL + "/assets/help-icon.svg"}
                alt="help-icon"
                className="icons"
              />
              <label className="text-label">Pusat Bantuan &gt;</label>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
export default TransactionDetail;
