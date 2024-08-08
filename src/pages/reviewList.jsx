import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";
import { GetCurrentUser, FormatRupiah, StarRating } from "../utils";

function ReviewList() {
  const user = GetCurrentUser();
  const [arrOrderItems, setArrOrderItems] = useState("");
  const [arrReviews, setArrReviews] = useState("");
  const [options, setOptions] = useState("");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    let orderData = [];
    if (user.role === "admin") {
      const orderItemsResponse = await axios.get(
        `http://localhost:8000/api/v1/order-item`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      orderData = orderItemsResponse.data.data.filter(
        (data) => data.Order.status === "Pesanan Diterima"
      );
    } else {
      const ordersResponse = await axios.get(
        `http://localhost:8000/api/v1/auth/order/user`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const orderFiltered = ordersResponse.data.data.filter(
        (data) => data.status === "Pesanan Diterima"
      );

      const orderItemsPromises = orderFiltered.map(async (data) => {
        const orderItemResponse = await axios.get(
          `http://localhost:8000/api/v1/auth/order-item/order/${data.id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        return orderItemResponse.data.data;
      });

      const orderItems = await Promise.all(orderItemsPromises);
      orderData = orderItems.flat();
    }

    // Fetch reviews
    const reviewResponse = await axios.get(
      `http://localhost:8000/api/v1/review`
    );
    const reviews = reviewResponse.data.data;

    const orderDataWithReviews = [];
    const orderDataWithoutReviews = [];

    orderData.forEach((orderItem) => {
      const matchingReview = reviews.find(
        (review) => review.Order_item.id === orderItem.id
      );
      if (matchingReview) {
        orderDataWithReviews.push(matchingReview);
      } else {
        orderDataWithoutReviews.push(orderItem);
      }
    });
    setArrOrderItems(orderDataWithoutReviews);
    setArrReviews(orderDataWithReviews);
  }, [user]);

  const handleOptions = (value) => {
    setOptions(value);
  };
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
    fetchData();
  }, [fetchData]);

  return (
    <>
      <NavbarLabel label={"DATA ULASAN"} />
      <div className="container pb-5">
        <div className="d-flex gap-3 mt-3">
          <div
            role="button"
            onClick={() => handleOptions("Belum Dinilai")}
            className="btn btn-dark text-btn"
          >
            Belum Dinilai
          </div>
          <div
            role="button"
            onClick={() => handleOptions("Sudah Dinilai")}
            className="btn btn-dark text-btn"
          >
            {user.role === "admin" ? <>Sudah Dinilai</> : <>Penilaian Saya</>}
          </div>
        </div>
        <div className="d-flex flex-column gap-2 py-3">
          {arrOrderItems || arrReviews ? (
            <>
              {options === "Belum Dinilai" ? (
                <>
                  {arrOrderItems.map((data) => {
                    return (
                      <div key={data.id} className="border">
                        <div className="px-2 py-1 bg-light border-bottom">
                          <label className="text-label">
                            No. Pesanan : {data.Order.code}
                          </label>
                        </div>
                        <div className="d-flex p-2 gap-2">
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
                          <div className="d-flex flex-column justify-content-between w-100">
                            <div className="d-flex flex-column gap-1">
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
                            <div className="d-flex justify-content-end">
                              {user.role === "admin" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openWhatsApp(
                                      data.Order.User.phone_number,
                                      `No. Pesanan : ${data.Order.code}, \nHalo!`
                                    )
                                  }
                                  className="btn btn-dark text-btn mt-1"
                                >
                                  Hubungi Pembeli
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/review/add/${data.id}`)
                                  }
                                  className="btn btn-dark text-btn mt-1"
                                >
                                  Nilai
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : options === "Sudah Dinilai" ? (
                <>
                  {arrReviews.map((data) => {
                    return (
                      <div key={data.id} className="border">
                        <div className="d-flex justify-content-between align-items-center bg-light border-bottom px-2 py-1">
                          <label className="text-label">
                            No. Pesanan : {data.Order_item.Order.code}
                          </label>
                          <div>
                            <StarRating value={data.rating} />
                          </div>
                        </div>
                        <div className="d-flex p-2 gap-2">
                          <div className="square-img-list">
                            {data.Order_item.Variant.Product.picture ? (
                              <img
                                src={`http://localhost:8000/public/products/${data.Order_item.Variant.Product.picture}`}
                                alt={data.Order_item.Variant.Product.picture}
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
                          <div className="d-flex flex-column justify-content-between w-100">
                            <div className="d-flex flex-column gap-1">
                              <label className="text-label">
                                {data.Order_item.Variant.Product.model}
                              </label>
                              <label className="text-normal">
                                {data.Order_item.Variant.ram}/
                                {data.Order_item.Variant.storage},&nbsp;
                                {data.Order_item.Variant.color}
                              </label>
                              <label className="text-normal">
                                <FormatRupiah
                                  number={data.Order_item.Variant.price}
                                />
                              </label>
                            </div>
                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                onClick={() => navigate(`/review/${data.id}`)}
                                className="btn btn-dark text-btn mt-1"
                              >
                                Lihat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  {arrOrderItems.map((data) => {
                    return (
                      <div key={data.id} className="border">
                        <div className="px-2 py-1 bg-light border-bottom">
                          <label className="text-label">
                            No. Pesanan : {data.Order.code}
                          </label>
                        </div>
                        <div className="d-flex p-2 gap-2">
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
                          <div className="d-flex flex-column justify-content-between w-100">
                            <div className="d-flex flex-column gap-1">
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
                            <div className="d-flex justify-content-end">
                              {user.role === "admin" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openWhatsApp(
                                      data.Order.User.phone_number,
                                      `No. Pesanan : ${data.Order.code}, \nHalo!`
                                    )
                                  }
                                  className="btn btn-dark text-btn mt-1"
                                >
                                  Hubungi Pembeli
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/review/add/${data.id}`)
                                  }
                                  className="btn btn-dark text-btn mt-1"
                                >
                                  Nilai
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {arrReviews.map((data) => {
                    return (
                      <div key={data.id} className="border">
                        <div className="d-flex justify-content-between align-items-center bg-light border-bottom px-2 py-1">
                          <label className="text-label">
                            No. Pesanan : {data.Order_item.Order.code}
                          </label>
                          <div>
                            <StarRating value={data.rating} />
                          </div>
                        </div>
                        <div className="d-flex p-2 gap-2">
                          <div className="square-img-list">
                            {data.Order_item.Variant.Product.picture ? (
                              <img
                                src={`http://localhost:8000/public/products/${data.Order_item.Variant.Product.picture}`}
                                alt={data.Order_item.Variant.Product.picture}
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
                          <div className="d-flex flex-column justify-content-between w-100">
                            <div className="d-flex flex-column gap-1">
                              <label className="text-label">
                                {data.Order_item.Variant.Product.model}
                              </label>
                              <label className="text-normal">
                                {data.Order_item.Variant.ram}/
                                {data.Order_item.Variant.storage},&nbsp;
                                {data.Order_item.Variant.color}
                              </label>
                              <label className="text-normal">
                                <FormatRupiah
                                  number={data.Order_item.Variant.price}
                                />
                              </label>
                            </div>
                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                onClick={() => navigate(`/review/${data.id}`)}
                                className="btn btn-dark text-btn mt-1"
                              >
                                Lihat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default ReviewList;
