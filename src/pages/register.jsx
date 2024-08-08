import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components";

function Register() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const data = {
      name: name,
      phone_number: phoneNumber,
      password: password,
    };

    axios
      .post(`http://localhost:8000/api/v1/register`, data)
      .then((res) => {
        alert("Berhasil!\nAkun anda berhasil dibuat.");
        navigate("/account/login");
      })
      .catch((err) => {
        const error = err.response.data.message;
        if (!Array.isArray(error)) {
          alert("Gagal!\n" + error);
        } else {
          error.forEach((msg) => {
            alert("Gagal!\n" + msg);
          });
        }
      });
  };

  return (
    <div className="bg-light" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="container d-flex justify-content-center py-4">
        <div className="register-container py-4">
          <div className="text-title text-center mb-4">Buat akun</div>
          <div className="register-form">
            <form onSubmit={handleRegister}>
              <div className="form-login-register p-5">
                <div className="text-secondary">
                  <label className="text-label">Nama Lengkap</label>
                  <input
                    className="form-control text-normal"
                    type="text"
                    placeholder="..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <label className="text-label mt-2">Nomor Telepon</label>
                  <input
                    className="form-control text-normal"
                    type="text"
                    placeholder="..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <label className="text-label mt-2">Password</label>
                  <div className="d-flex flex-row align-items-center">
                    <input
                      className="form-control text-normal"
                      type={showPassword ? "text" : "password"}
                      placeholder="..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: "42px" }}
                    />
                    <div className="pwd-icon" onClick={togglePassword}>
                      <img
                        src={
                          process.env.PUBLIC_URL +
                          `/assets/${
                            showPassword ? "show" : "hide"
                          }-pwd-icon.svg`
                        }
                        alt={showPassword ? "show-password" : "hide-password"}
                        className="icons"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-note">
                  note: kata sandi minimal 8 karakter.
                </div>
                <button
                  className="btn btn-dark w-100 text-btn mt-5"
                  type="submit"
                >
                  DAFTAR
                </button>
                <div className="text-note pt-2">
                  Sudah memiliki akun?&nbsp;
                  <a className="text-note text-dark" href="/account/login">
                    Masuk
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
