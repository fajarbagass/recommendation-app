import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { NavbarLabel } from "../components";

function AccountDetail() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [picture, setPicture] = useState("");
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const getCurrentUser = async () => {
    const res = await axios.get("http://localhost:8000/api/v1/auth/user", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const formattedBirthDate = moment(res.data.data.birth_date).format(
      "YYYY-MM-DD"
    );
    setName(res.data.data.name);
    setEmail(res.data.data.email);
    setBirthDate(formattedBirthDate);
    setPhoneNumber(res.data.data.phone_number);
    setAddress(res.data.data.address);
    setPicture(res.data.data.picture);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (picture !== null) {
      formData.append("picture", picture);
    }
    formData.append("name", name);
    formData.append("email", email);
    formData.append("birth_date", birthDate);
    formData.append("phone_number", phoneNumber);
    formData.append("address", address);

    try {
      await axios.patch("http://localhost:8000/api/v1/auth/user", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Berhasil !\nData akun berhasil diperbarui.");
      window.scrollTo(0, 0);
    } catch (err) {
      const errorMessages = err.response.data.message;
      errorMessages.forEach((msg) => {
        alert("Gagal !\n" + msg);
      });
    }
  };

  const handleFileClick = (e) => {
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
    getCurrentUser();
  }, []);

  return (
    <>
      <NavbarLabel label={"DETAIL AKUN"} />
      <div className="container py-4">
        <form onSubmit={handleUpdateAccount}>
          <div className="d-flex flex-column align-items-center">
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
                      src={`http://localhost:8000/public/users/${picture}`}
                      alt={picture}
                      className="input-picture"
                    />
                  )}
                </>
              ) : (
                <div className="input-picture text-label">Upload Foto</div>
              )}
            </div>
            <div className="my-3">
              <button
                onClick={handleFileClick}
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
          <div>
            <label className="text-label mt-2">Nama Lengkap</label>
            <input
              className="form-control text-normal"
              type="text"
              placeholder="..."
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="text-label mt-2">Email</label>
            <input
              className="form-control text-normal"
              type="text"
              placeholder="..."
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="text-label mt-2">Nomor Telepon</label>
            <input
              className="form-control text-normal"
              type="text"
              placeholder="..."
              value={phoneNumber || ""}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <label className="text-label mt-2">Tanggal Lahir</label>
            <input
              className="form-control text-normal"
              type="date"
              value={birthDate || ""}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <label className="text-label mt-2">Alamat</label>
            <textarea
              className="form-control text-normal"
              rows="5"
              placeholder="..."
              value={address || ""}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="text-note pt-2">
              note: tulis alamat lengkap dengan jalan, rt/rw, no.rumah dll.
            </div>
          </div>
          <div className="d-flex justify-content-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary text-btn w-25"
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

export default AccountDetail;
