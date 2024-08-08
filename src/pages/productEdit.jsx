import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";

function ProductEdit() {
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
  const { id } = useParams();

  const getAllBrands = async () => {
    const res = await axios.get(`http://localhost:8000/api/v1/brand`);
    setBrandData(res.data.data);
  };

  const findProduct = useCallback(async () => {
    const res = await axios.get(`http://localhost:8000/api/v1/product/${id}`);
    const checkBrand = res.data.data.Brand;
    if (checkBrand) {
      setBrand(res.data.data.Brand.id);
    }
    setModel(res.data.data.model);
    setOs(res.data.data.os);
    setChipset(res.data.data.chipset);
    setDisplay(res.data.data.display);
    setCamera(res.data.data.camera);
    setBattery(res.data.data.battery);
    setNetwork(res.data.data.network);
    setCharging(res.data.data.charging);
    setPicture(res.data.data.picture);
    setDescription(res.data.data.description);
  }, [id]);

  const hanldeEditProduct = async (e) => {
    e.preventDefault();
    const form = new FormData();
    if (brand) {
      form.append("brand_id", brand);
    }
    if (picture) {
      form.append("picture", picture);
    }
    form.append("model", model);
    form.append("os", os);
    form.append("chipset", chipset);
    form.append("display", display);
    form.append("camera", camera);
    form.append("battery", battery);
    form.append("network", network);
    form.append("charging", charging);
    form.append("description", description);
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/auth/product/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Berhasil !\nData produk telah berhasil diperbarui.");
      navigate(-1);
    } catch (err) {
      const error = err.response.data.message;
      error.forEach((msg) => {
        alert("Gagal !\n" + msg);
      });
    }
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

  useEffect(() => {
    findProduct();
    getAllBrands();
  }, [findProduct]);
  return (
    <>
      <NavbarLabel label={"EDIT PRODUK"} />
      <div className="container">
        <form className="py-3" onSubmit={hanldeEditProduct}>
          <div className="d-flex justify-content-center flex-wrap-reverse gap-4">
            <div>
              <div className="square-input-picture ">
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
                        src={`http://localhost:8000/public/products/${picture}`}
                        alt={picture}
                        className="input-picture"
                      />
                    )}
                  </>
                ) : (
                  <div className="input-picture text-label">Foto Produk</div>
                )}
              </div>
              <div className="text-center my-3">
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
            <div className="form-input">
              <label className="text-label">Brand</label>
              <select
                className="form-control text-normal"
                value={brand || ""}
                onChange={(e) => {
                  const selected = e.target.value;
                  setBrand(selected);
                }}
              >
                <option value="">...</option>
                <>
                  {brandData.map((data) => {
                    return (
                      <option key={data.id} value={data.id}>
                        {data.name}
                      </option>
                    );
                  })}
                </>
              </select>
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
export default ProductEdit;
