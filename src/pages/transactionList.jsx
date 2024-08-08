import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";
import { GetCurrentUser, FormatRupiah } from "../utils";

function TransactionList() {
  const user = GetCurrentUser();
  const [arrOrder, setArrOrder] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  const navigate = useNavigate();

  const getOrderData = useCallback(async () => {
    let orderRes = "";
    if (user.role === "admin") {
      const res = await axios.get(`http://localhost:8000/api/v1/auth/order`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      orderRes = res.data.data;
      orderRes.sort((a, b) => b.id - a.id);
      orderRes.sort((a, b) => {
        if (
          a.status === "Menunggu Konfirmasi" &&
          b.status !== "Menunggu Konfirmasi"
        ) {
          return -1;
        }
        if (
          a.status !== "Menunggu Konfirmasi" &&
          b.status === "Menunggu Konfirmasi"
        ) {
          return 1;
        }
        return 0;
      });
    } else {
      const res = await axios.get(
        `http://localhost:8000/api/v1/auth/order/user`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      orderRes = res.data.data;
      orderRes.sort((a, b) => b.id - a.id);
      orderRes.sort((a, b) => {
        if (
          a.status === "Menunggu Pembayaran" &&
          b.status !== "Menunggu Pembayaran"
        ) {
          return -1;
        }
        if (
          a.status !== "Menunggu Pembayaran" &&
          b.status === "Menunggu Pembayaran"
        ) {
          return 1;
        }
        return 0;
      });
    }
    const orders = await Promise.all(
      orderRes.map(async (data) => {
        const orderItemRes = await axios.get(
          `http://localhost:8000/api/v1/auth/order-item/order/${data.id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const orderItems = orderItemRes.data.data;
        const totalProduct = orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const orderData = orderItems[0];
        return {
          orderData,
          totalProduct,
        };
      })
    );
    setArrOrder(orders);
  }, [user]);

  const handleStatus = (value) => {
    setSelectedStatus(value);
  };

  const orderListData = (value) => {
    return (
      <div
        key={value.orderData.id}
        role="button"
        onClick={() => navigate(`/transaction/${value.orderData.Order.id}`)}
        className="d-flex flex-column border"
      >
        <div className="border-bottom px-2 py-1 bg-light">
          <div className="d-flex justify-content-between">
            <label className="text-label">
              No. Pesanan : {value.orderData.Order.code}
            </label>
            <label className="text-normal">
              {value.orderData.Order.status}
            </label>
          </div>
        </div>
        <div className="d-flex p-2 gap-2">
          <div className="square-img-list">
            {value.orderData.Variant.Product.picture ? (
              <img
                src={`http://localhost:8000/public/products/${value.orderData.Variant.Product.picture}`}
                alt={value.orderData.Variant.Product.picture}
                className="img-list"
              />
            ) : (
              <img
                src={process.env.PUBLIC_URL + "/assets/no-img-product.jpg"}
                alt="no-img-product"
                className="img-list"
              />
            )}
          </div>
          <div className="d-flex flex-column justify-content-between w-100">
            <div className="d-flex flex-column gap-1">
              <label className="text-label">
                {value.orderData.Variant.Product.model}
              </label>
              <label className="text-normal text-secondary">
                {value.orderData.Variant.ram}/{value.orderData.Variant.storage}
                ,&nbsp;
                {value.orderData.Variant.color}
              </label>
              <label className="text-normal">
                <FormatRupiah number={value.orderData.Variant.price} />
              </label>
            </div>
            <div className="d-flex justify-content-end">
              <label className="text-label">
                Total {value.totalProduct} produk :&nbsp;
                <FormatRupiah number={value.orderData.Order.total} />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getOrderData();
  }, [getOrderData]);

  return (
    <>
      <NavbarLabel label={"DATA TRANSAKSI"} />
      <div className="container pb-5">
        <div className="d-flex gap-3 py-3">
          {user.role === "admin" ? (
            <div
              onClick={() => handleStatus("Semua")}
              className="btn btn-dark text-btn"
            >
              Semua
            </div>
          ) : (
            <div
              onClick={() => handleStatus("Belum Bayar")}
              className="btn btn-dark text-btn"
            >
              Belum Bayar
            </div>
          )}
          <div
            onClick={() => handleStatus("Dikemas")}
            className="btn btn-dark text-btn"
          >
            Dikemas
          </div>
          <div
            onClick={() => handleStatus("Dikirim")}
            className="btn btn-dark text-btn"
          >
            Dikirim
          </div>
          <div
            onClick={() => handleStatus("Selesai")}
            className="btn btn-dark text-btn"
          >
            Selesai
          </div>
          <div
            onClick={() => handleStatus("Dibatalkan")}
            className="btn btn-dark text-btn"
          >
            Dibatalkan
          </div>
        </div>
        <div className="d-flex flex-column gap-2">
          {arrOrder.map((data) => {
            if (selectedStatus === "Semua") {
              if (
                user.role === "admin" &&
                data.orderData.Order.status !== "Menunggu Pembayaran"
              ) {
                return orderListData(data);
              } else if (user.role === "client") {
                return orderListData(data);
              }
            } else if (
              selectedStatus === "Belum Bayar" &&
              data.orderData.Order.status === "Menunggu Pembayaran"
            ) {
              return orderListData(data);
            } else if (
              selectedStatus === "Dikemas" &&
              (data.orderData.Order.status === "Menunggu Konfirmasi" ||
                data.orderData.Order.status === "Dikemas")
            ) {
              return orderListData(data);
            } else if (
              selectedStatus === "Dikirim" &&
              (data.orderData.Order.status === "Dalam Pengiriman" ||
                data.orderData.Order.status === "Terkirim")
            ) {
              return orderListData(data);
            } else if (
              selectedStatus === "Selesai" &&
              data.orderData.Order.status === "Pesanan Diterima"
            ) {
              return orderListData(data);
            } else if (
              selectedStatus === "Dibatalkan" &&
              data.orderData.Order.status === "Pesanan Dibatalkan"
            ) {
              return orderListData(data);
            }
            return null;
          })}
        </div>
      </div>
    </>
  );
}

export default TransactionList;
