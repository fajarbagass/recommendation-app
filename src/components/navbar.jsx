import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GetCurrentUser } from "../utils";
import Category from "./category";

function Navbar() {
  const user = GetCurrentUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("orderItems");
    localStorage.removeItem("purchasedItem");
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  const handleMenu = (value) => {
    navigate(value);
    window.location.reload();
  };
  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/product", {
      state: { search: search },
    });
  };

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      localStorage.removeItem("options");
    }
  }, [token]);
  return (
    <div className="nav-container">
      <div className="nav-body py-3">
        {/* Logo */}
        <div className="w-25 text-center">
          <Link className="text-logo" to={"/"}>
            <img
              src={process.env.PUBLIC_URL + "/assets/logo-image.png"}
              alt="logo-image"
              className="nav-logo"
            />
          </Link>
        </div>
        {/* Search Bar */}
        <form
          className="w-50 search-bar ps-2"
          role="search"
          onSubmit={handleSearch}
        >
          <input
            className="form-control"
            type="search"
            placeholder="Cari disini.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="search-icon" role="button" onClick={handleSearch}>
            <img
              src={process.env.PUBLIC_URL + "/assets/search-icon.svg"}
              alt="search-icon"
              className="icons"
            />
          </div>
        </form>
        {/* Menu */}
        <div className="w-25 nav-menu gap-4">
          <div className="d-flex flex-row gap-2">
            {!isLoggedIn ? (
              <>
                <div id="account1" className="d-flex flex-row gap-2">
                  <img
                    src={process.env.PUBLIC_URL + "/assets/account-icon.svg"}
                    alt="account"
                    className="icons"
                  />
                  <p className="m-0">
                    <Link to={"/account/login"} className="text-login-register">
                      Masuk
                    </Link>
                    &nbsp;/&nbsp;
                    <Link
                      to={"/account/register"}
                      className="text-login-register"
                    >
                      Daftar
                    </Link>
                  </p>
                </div>
                <img
                  src={process.env.PUBLIC_URL + "/assets/shopbag-icon.svg"}
                  alt="cart"
                  className="icons ms-2"
                />
              </>
            ) : (
              <>
                <div
                  role="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasRight"
                  aria-controls="offcanvasRight"
                >
                  {user.role === "admin" ? (
                    <div className="d-flex align-items-center gap-2 text-label">
                      <img
                        src={
                          process.env.PUBLIC_URL + "/assets/account-icon.svg"
                        }
                        alt="account"
                        className="icons"
                      />
                      ADMIN
                    </div>
                  ) : (
                    <img
                      src={process.env.PUBLIC_URL + "/assets/account-icon.svg"}
                      alt="account"
                      className="icons"
                    />
                  )}
                </div>
                <div
                  className="offcanvas offcanvas-end"
                  tabIndex="-1"
                  id="offcanvasRight"
                  aria-labelledby="offcanvasRightLabel"
                >
                  <div className="offcanvas-header">
                    <Link to={"/"}>
                      <img
                        src={process.env.PUBLIC_URL + "/assets/logo-image.png"}
                        alt="logo-image"
                        className="nav-logo"
                      />
                    </Link>
                    <button
                      type="button"
                      className="btn-close text-reset"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    />
                  </div>
                  <div className="offcanvas-body d-flex flex-column justify-content-between text-normal">
                    {user.role === "admin" ? (
                      <div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/account/user")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL +
                              "/assets/account-icon.svg"
                            }
                            alt="account-icon"
                            className="icons"
                          />
                          Pengaturan Akun
                        </div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/account/product")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL +
                              "/assets/product-icon.svg"
                            }
                            alt="product-icon"
                            className="icons"
                          />
                          Daftar Produk
                        </div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/transaction")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL +
                              "/assets/transaction-icon.svg"
                            }
                            alt="transaction-icon"
                            className="icons"
                          />
                          Daftar Transaksi
                        </div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/review")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL + "/assets/review-icon.svg"
                            }
                            alt="review-icon"
                            className="icons"
                          />
                          Daftar Ulasan
                        </div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/account/user-list")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL + "/assets/user-icon.svg"
                            }
                            alt="user-icon"
                            className="icons"
                          />
                          Daftar Pengguna
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/account/user")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL +
                              "/assets/account-icon.svg"
                            }
                            alt="account-icon"
                            className="icons"
                          />
                          Detail Akun
                        </div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/transaction")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL +
                              "/assets/transaction-icon.svg"
                            }
                            alt="transaction-icon"
                            className="icons"
                          />
                          Pesanan Saya
                        </div>
                        <div
                          className="list-menu"
                          role="button"
                          onClick={() => handleMenu("/review")}
                        >
                          <img
                            src={
                              process.env.PUBLIC_URL + "/assets/review-icon.svg"
                            }
                            alt="review-icon"
                            className="icons"
                          />
                          Ulasan Produk
                        </div>
                      </div>
                    )}
                    <div
                      className="list-menu"
                      role="button"
                      onClick={handleLogout}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/assets/logout-icon.svg"}
                        alt="logout-icon"
                        className="icons"
                      />
                      Keluar
                    </div>
                  </div>
                </div>
                {user.role !== "admin" ? (
                  <div role="button" onClick={() => handleMenu("/cart")}>
                    <img
                      src={process.env.PUBLIC_URL + "/assets/shopbag-icon.svg"}
                      alt="cart"
                      className="icons ms-2"
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      <Category />
    </div>
  );
}
export default Navbar;
