import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Navbar, CardProduct } from "../components";

function SearchPage() {
  const [products, setProducts] = useState([]);
  const location = new useLocation();
  const [priceSequence, setPriceSequence] = useState("");

  const productFilter = useCallback(async () => {
    let queryParam = "";
    if (location.state.search) {
      queryParam = "search=" + location.state.search;
      setPriceSequence("");
    } else if (location.state.brand) {
      queryParam = "brand=" + location.state.brand;
      setPriceSequence("");
    }

    const productsResponse = await axios.get(
      `http://localhost:8000/api/v1/product?${queryParam}`
    );

    const arrProducts = productsResponse.data.data;

    // Fetch variants, orders, and reviews in parallel
    const variantsPromises = arrProducts.map((product) =>
      axios.get(`http://localhost:8000/api/v1/variant/product/${product.id}`)
    );
    const ordersPromise = axios.get("http://localhost:8000/api/v1/order-item");
    const reviewsPromise = axios.get("http://localhost:8000/api/v1/review");
    // Await all the promises
    const [variantsResponses, ordersResponse, reviewsResponse] =
      await Promise.all([
        Promise.all(variantsPromises),
        ordersPromise,
        reviewsPromise,
      ]);

    const orders = ordersResponse.data.data;
    const reviews = reviewsResponse.data.data;

    // Process product data
    const productData = arrProducts
      .map((product, index) => {
        const variants = variantsResponses[index].data.data;
        const validVariants = variants.filter((variant) => variant.stock > 0);

        if (validVariants.length === 0) {
          return null;
        }

        const cheapestVariant = validVariants.reduce((prev, curr) =>
          prev.price < curr.price ? prev : curr
        );

        // Calculate sold quantity
        const sold = orders
          .filter((order) => order.Variant.Product.id === product.id)
          .reduce((sum, order) => sum + order.quantity, 0);

        // Calculate rating
        const rating = reviews
          .filter(
            (review) => review.Order_item.Variant.Product.id === product.id
          )
          .reduce((sum, review) => sum + review.rating, 0);

        const reviewCount = reviews.filter(
          (review) => review.Order_item.Variant.Product.id === product.id
        ).length;

        return {
          id: product.id,
          Variant: cheapestVariant,
          sold: sold,
          rating: reviewCount > 0 ? rating / reviewCount : 0,
        };
      })
      .filter((item) => item !== null);
    setProducts(productData);
  }, [location.state]);
  const handlePriceSequence = () => {
    if (priceSequence === "") {
      setPriceSequence("up");
      products.sort((a, b) => a.Variant.price - b.Variant.price);
    } else if (priceSequence === "up") {
      setPriceSequence("down");
      products.sort((a, b) => b.Variant.price - a.Variant.price);
    } else if (priceSequence === "down") {
      setPriceSequence("up");
      products.sort((a, b) => a.Variant.price - b.Variant.price);
    }
  };

  useEffect(() => {
    productFilter();
  }, [productFilter, location.state]);

  return (
    <>
      <Navbar />
      <div className="container py-3">
        <div className="d-flex justify-content-between">
          {location.state.search ? (
            <div>
              <label className="text-label">
                Hasil pencarian produk:&nbsp;
              </label>
              <label className="text-normal">
                <>{location.state.search}</>
              </label>
            </div>
          ) : location.state.brand ? (
            <div>
              <label className="text-label">Hasil pencarian brand:&nbsp;</label>
              <label className="text-normal">
                <>{location.state.brand}</>
              </label>
            </div>
          ) : null}
          <div
            role="button"
            className="text-label"
            onClick={handlePriceSequence}
          >
            Harga&nbsp;
            {priceSequence === "" ? (
              <img
                src={process.env.PUBLIC_URL + "/assets/up-down-arrow-icon.svg"}
                alt="up-down-arrow-icon"
                className="icons"
              />
            ) : priceSequence === "up" ? (
              <img
                src={process.env.PUBLIC_URL + "/assets/up-arrow-icon.svg"}
                alt="up-arrow-icon"
                className="icons"
              />
            ) : priceSequence === "down" ? (
              <img
                src={process.env.PUBLIC_URL + "/assets/down-arrow-icon.svg"}
                alt="down-arrow-icon"
                className="icons"
              />
            ) : null}
          </div>
        </div>
        <div className="d-flex justify-content-center">
          {products.length !== 0 ? (
            <div className="product-list-data">
              {products.map((data, index) => {
                return <CardProduct key={data.id} data={data} index={index} />;
              })}
            </div>
          ) : (
            <div className="not-found text-title">Produk tidak ditemukan</div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchPage;
