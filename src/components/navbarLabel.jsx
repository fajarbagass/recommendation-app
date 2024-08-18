import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { GetCurrentUser } from "../utils";

function NavbarLabel({ label }) {
  const user = GetCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("orderItems");
    localStorage.removeItem("purchasedItem");
    navigate("/");
    window.location.reload();
  };
  const handleMenu = (value) => {
    navigate(value);
    window.location.reload();
  };

  return (
    <div className="nav-label-container">
      <div className="nav-body py-1">
        {/* Back Button */}
        <div className="w-25 text-center">
          <img
            src={process.env.PUBLIC_URL + "/assets/back-button-icon.svg"}
            alt="back-button-icon"
            className="back-btn-icon"
            role="button"
            onClick={() => navigate(-1)}
          />
        </div>
        {/* Label */}
        <div className="w-50 text-logo text-center text-white">{label}</div>
        {/* Menu */}
        <div className="w-25 nav-menu gap-4">
          <div className="d-flex flex-row gap-2">
            <div
              role="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasRight"
              aria-controls="offcanvasRight"
            >
              {user.role === "admin" ? (
                <div className="d-flex align-items-center gap-2 text-label text-white">
                  <img
                    src={
                      process.env.PUBLIC_URL + "/assets/account-wht-icon.svg"
                    }
                    alt="account-wht-icon"
                    className="icons"
                  />
                  ADMIN
                </div>
              ) : (
                <img
                  src={process.env.PUBLIC_URL + "/assets/account-wht-icon.svg"}
                  alt="account-wht-icon"
                  className="icons"
                />
              )}
            </div>
            <div
              className="offcanvas offcanvas-end"
              tabIndex="1"
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
                          process.env.PUBLIC_URL + "/assets/account-icon.svg"
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
                          process.env.PUBLIC_URL + "/assets/product-icon.svg"
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
                        src={process.env.PUBLIC_URL + "/assets/review-icon.svg"}
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
                        src={process.env.PUBLIC_URL + "/assets/user-icon.svg"}
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
                          process.env.PUBLIC_URL + "/assets/account-icon.svg"
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
                        src={process.env.PUBLIC_URL + "/assets/review-icon.svg"}
                        alt="review-icon"
                        className="icons"
                      />
                      Ulasan Produk
                    </div>
                  </div>
                )}
                <div className="list-menu" role="button" onClick={handleLogout}>
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
                  src={process.env.PUBLIC_URL + "/assets/shopbag-wht-icon.svg"}
                  alt="cart"
                  className="icons ms-2"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavbarLabel;
