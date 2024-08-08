import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";

function ProductAdd() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [os, setOs] = useState("");
  const [chipset, setChipset] = useState("");
  const [display, setDisplay] = useState("");
  const [camera, setCamera] = useState("");
  const [battery, setBattery] = useState("");
  const [network, setNetwork] = useState("");
  const [charging, setCharging] = useState("");
  const [picture, setPicture] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [brandData, setBrandData] = useState([]);
  const navigate = useNavigate();

  const fetchAllBrands = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/brand`);
      const brands = response.data.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setBrandData(brands);
    } catch (error) {
      console.error("Error fetching brands: ", error);
    }
  };

  const handleFileClick = (e) => {
    e.preventDefault();
    document.getElementById("fileInput").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (brand) {
      formData.append("brand_id", brand);
    }
    if (picture) {
      formData.append("picture", picture);
    }
    formData.append("model", model);
    formData.append("os", os);
    formData.append("chipset", chipset);
    formData.append("display", display);
    formData.append("camera", camera);
    formData.append("battery", battery);
    formData.append("network", network);
    formData.append("charging", charging);
    formData.append("description", description);

    try {
      await axios.post(`http://localhost:8000/api/v1/auth/product`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Berhasil !\nData produk berhasil ditambahkan.");
      navigate("/account/product");
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((msg) => alert("Gagal !\n" + msg));
      } else {
        alert("Gagal !\nTerjadi kesalahan saat menambahkan produk.");
      }
    }
  };

  useEffect(() => {
    fetchAllBrands();
  }, []);

  return (
    <>
      <NavbarLabel label={"TAMBAH PRODUK"} />
      <div className="container">
        <form className="py-3" onSubmit={handleAddProduct}>
          <div className="d-flex justify-content-center flex-wrap-reverse gap-4">
            <div>
              <div className="square-input-picture">
                {picture ? (
                  <img
                    id="imagePreview"
                    src={preview}
                    alt="Preview"
                    className="input-picture"
                  />
                ) : (
                  <div className="input-picture text-label">Foto Produk</div>
                )}
              </div>
              <div className="text-center my-3">
                <button
                  onClick={handleFileClick}
                  className="btn btn-dark text-btn px-5"
                >
                  Upload Foto
                </button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="form-input">
              <label className="text-label">Brand</label>
              <select
                className="form-control text-normal"
                value={brand || ""}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">...</option>
                {brandData.map((data) => (
                  <option key={data.id} value={data.id}>
                    {data.name}
                  </option>
                ))}
              </select>
              {/* Input fields for other product details */}
              <label className="text-label mt-2">Model Produk</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <label className="text-label mt-2">Sistem Operasi</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={os}
                onChange={(e) => setOs(e.target.value)}
              />
              <label className="text-label mt-2">Spesifikasi Prosessor</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={chipset}
                onChange={(e) => setChipset(e.target.value)}
              />
              <label className="text-label mt-2">Spesifikasi Layar</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
              />
              <label className="text-label mt-2">Spesifikasi Kamera</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
              />
              <label className="text-label mt-2">Spesifikasi Baterai</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={battery}
                onChange={(e) => setBattery(e.target.value)}
              />
              <label className="text-label mt-2">Spesifikasi Jaringan</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              />
              <label className="text-label mt-2">Kapasitas Charger</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={charging}
                onChange={(e) => setCharging(e.target.value)}
              />
              <label className="text-label mt-2">Deskripsi Produk</label>
              <textarea
                className="form-control text-normal"
                rows="5"
                placeholder="..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <button
              type="button"
              className="btn btn-secondary text-btn w-25"
              onClick={() => navigate(-1)}
            >
              KEMBALI
            </button>
            <button type="submit" className="btn btn-dark text-btn w-25">
              SIMPAN
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ProductAdd;
