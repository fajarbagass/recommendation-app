import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components";

function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const data = {
      phone_number: phoneNumber,
      password: password,
    };

    axios
      .post(`http://localhost:8000/api/v1/login`, data)
      .then((res) => {
        localStorage.setItem("token", res.data.data.token);
        navigate("/");
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("orderItems");
    localStorage.removeItem("purchasedItem");
    window.location.reload();
  };

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  return (
    <div className="bg-light" style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="container d-flex justify-content-center py-4">
        {!isLoggedIn ? (
          <div className="login-container py-4">
            <div className="text-title text-center mb-4">
              Masuk ke akun Anda
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-login-register p-5">
                <div className="text-secondary">
                  <label className="text-label">Nomor Telepon</label>
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
                <button
                  className="btn btn-dark w-100 text-btn mt-5"
                  type="submit"
                >
                  MASUK
                </button>
                <div className="text-note mt-2">
                  Belum memiliki akun?&nbsp;
                  <a className="text-note text-dark" href="/account/register">
                    Daftar
                  </a>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center text-title">
            Anda sudah masuk, silahkan tekan tombol dibawah ini untuk keluar
            dari akun anda. <br />
            <button
              type="button"
              onClick={handleLogout}
              className="btn-small text-btn px-5"
            >
              KELUAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
