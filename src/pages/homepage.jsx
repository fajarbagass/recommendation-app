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
      <div className="d-flex justify-content-center my-2 py-1">
        <img
          src={process.env.PUBLIC_URL + "/assets/banner-image.jpg"}
          alt="banner-image"
          className="banner-home"
        />
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
