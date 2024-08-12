import React from "react";
import { Navbar, CardProduct, Footer } from "../components";
import { Collaborative } from "../method";
import { FindProductAvailable } from "../utils";

function Homepage() {
  const products = FindProductAvailable();
  const productsBySold = products.sort((a, b) => b.sold - a.sold);

  return (
    <>
      <Navbar />
      <div className="banner-home py-5">
        <div
          className="text-white text-title-lg d-flex justify-content-center align-items-center "
          style={{ width: "260px" }}
        >
          LOGO
        </div>
        <div className="text-white">
          <label className="text-title-lg">Selamat Datang di Toko HPku!</label>
          <p className="text-normal" style={{ maxWidth: "320px" }}>
            Temukan Beragam Pilihan Merek HP Terbaik Hanya di Sini.
          </p>
        </div>
      </div>
      <div className="container py-3">
        <Collaborative />
        {productsBySold.length !== 0 ? (
          <div className="mb-4">
            <div className="title-card-list">
              <label className="text-title-list">Produk terlaris</label>
            </div>
            <div className="product-card-list">
              {productsBySold.map((data, index) => {
                if (index < 6) {
                  return (
                    <CardProduct key={data.id} data={data} index={index} />
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </>
  );
}

export default Homepage;
