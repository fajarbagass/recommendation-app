import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";
import { FormatRupiah } from "../utils";

function ReviewAdd() {
  const [item, setItem] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [picture, setPicture] = useState("");
  const [preview, setPreview] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  const findItemData = useCallback(async () => {
    const res = await axios.get(
      `http://localhost:8000/api/v1/auth/order-item/${id}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    setItem(res.data.data);
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
  const handleAddReview = async (e) => {
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
      await axios.post(`http://localhost:8000/api/v1/auth/review`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Berhasil !\nData ulasan berhasil dibuat.");
      navigate("/review");
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
                No. Pesanan : {item.Order.code}
              </label>
            </div>
            <div className="d-flex p-2 gap-2">
              <div className="square-img-list">
                {item.Variant.Product.picture ? (
                  <img
                    src={`http://localhost:8000/public/products/${item.Variant.Product.picture}`}
                    alt={item.Variant.Product.picture}
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
                  {item.Variant.Product.model}
                </label>
                <label className="text-normal">
                  {item.Variant.ram}/{item.Variant.storage},&nbsp;
                  {item.Variant.color}
                </label>
                <label className="text-normal">
                  <FormatRupiah number={item.Variant.price} />
                </label>
                <label className="text-normal">{item.quantity} produk</label>
              </div>
            </div>
          </div>
        ) : null}
        <form onSubmit={handleAddReview}>
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
                  <img
                    id="image"
                    src={preview}
                    alt={preview}
                    className="input-picture"
                  />
                ) : (
                  <div className="input-picture text-label">Foto Produk</div>
                )}
              </div>
              <div className="my-3 ps-3">
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
      </div>
    </>
  );
}

export default ReviewAdd;
