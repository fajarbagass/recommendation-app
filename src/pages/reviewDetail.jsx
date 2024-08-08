import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";
import { FormatRupiah, GetCurrentUser, StarRating } from "../utils";

function ReviewDetail() {
  const user = GetCurrentUser();
  const [item, setItem] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [picture, setPicture] = useState("");
  const [preview, setPreview] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  const findItemData = useCallback(async () => {
    const res = await axios.get(`http://localhost:8000/api/v1/review/${id}`);
    setItem(res.data.data);
    setRating(res.data.data.rating);
    setReview(res.data.data.review);
    setPicture(res.data.data.picture);
  }, [id]);

  const handleRating = (selectedRating) => {
    setRating(selectedRating);
  };
  const handleFile = (e) => {
    e.preventDefault();
    document.getElementById("getFile").click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleEditReview = async (e) => {
    e.preventDefault();
    const form = new FormData();
    if (rating === 0) {
      alert("Peringatan !\nMasukkan data rating dengan benar.");
      return;
    }
    if (picture) {
      form.append("picture", picture);
    }
    form.append("order_item_id", id);
    form.append("rating", rating);
    form.append("review", review);
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/auth/review/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Berhasil !\nData ulasan berhasil dibuat.");
      window.location.reload();
    } catch (err) {
      const error = err.response.data.message;
      error.forEach((msg) => {
        alert("Gagal !\n" + msg);
      });
    }
  };
  useEffect(() => {
    findItemData();
  }, [findItemData]);
  return (
    <>
      <NavbarLabel label={"Detail Ulasan"} />
      <div className="container py-3">
        {item ? (
          <div className="border-bottom pb-2">
            <div className="border-top border-bottom bg-light p-2">
              <label className="text-label">
                No. Pesanan : {item.Order_item.Order.code}
              </label>
            </div>
            <div className="d-flex p-2 gap-2">
              <div className="square-img-list">
                {item.Order_item.Variant.Product.picture ? (
                  <img
                    src={`http://localhost:8000/public/products/${item.Order_item.Variant.Product.picture}`}
                    alt={item.Order_item.Variant.Product.picture}
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
              <div className="d-flex flex-column gap-1">
                <label className="text-label">
                  {item.Order_item.Variant.Product.model}
                </label>
                <label className="text-normal">
                  {item.Order_item.Variant.ram}/
                  {item.Order_item.Variant.storage},&nbsp;
                  {item.Order_item.Variant.color}
                </label>
                <label className="text-normal">
                  <FormatRupiah number={item.Order_item.Variant.price} />
                </label>
                <label className="text-normal">
                  {item.Order_item.quantity} produk
                </label>
              </div>
            </div>
          </div>
        ) : null}
        {user.role === "admin" ? (
          <div>
            <div className="mt-2">
              <label className="text-label">Rating produk</label>
              <StarRating value={item.rating} />
            </div>
            {item.review ? (
              <div className="mt-2">
                <label className="text-label">Ulasan tentang produk</label>
                <div className="border rounded p-2">
                  <p>{item.review}</p>
                </div>
              </div>
            ) : null}
            {item.picture ? (
              <div className="mt-2">
                <label className="text-label">Foto ulasan</label>
                <div className="square-img-review">
                  <img
                    id="image"
                    src={`http://localhost:8000/public/reviews/${item.picture}`}
                    alt={item.picture}
                    className="img-review"
                  />
                </div>
              </div>
            ) : null}
            <div className="py-3 d-flex justify-content-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary text-btn"
              >
                KEMBALI
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEditReview}>
            <div className="mt-2">
              <label className="text-label">Rating produk</label>
              <div className="d-flex p-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div
                    role="button"
                    key={value}
                    style={{
                      backgroundImage: `url(${
                        value <= rating
                          ? "/assets/star-full-icon.svg"
                          : "/assets/star-blank-icon.svg"
                      })`,
                    }}
                    className="icons"
                    onClick={(e) => handleRating(value)}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2">
              <label className="text-label">Ulasan tentang produk</label>
              <textarea
                className="form-control text-normal"
                rows="5"
                placeholder="..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label className="text-label">Foto ulasan</label>
              <div className="d-flex flex-column">
                <div className="square-input-picture">
                  {picture ? (
                    <>
                      {preview ? (
                        <img
                          id="image"
                          src={preview}
                          alt={preview}
                          className="input-picture"
                        />
                      ) : (
                        <img
                          id="image"
                          src={`http://localhost:8000/public/reviews/${picture}`}
                          alt={picture}
                          className="input-picture"
                        />
                      )}
                    </>
                  ) : (
                    <div className="input-picture text-label">Upload Foto</div>
                  )}
                </div>
                <div className="ps-3 my-3">
                  <button
                    onClick={handleFile}
                    className="btn btn-dark text-btn px-5"
                  >
                    Upload Foto
                  </button>
                  <input
                    type="file"
                    id="getFile"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
            <div className="py-3 d-flex justify-content-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary text-btn"
              >
                KEMBALI
              </button>
              <button type="submit" className="btn btn-dark text-btn">
                SIMPAN
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default ReviewDetail;
