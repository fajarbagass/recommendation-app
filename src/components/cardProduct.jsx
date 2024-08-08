import React from "react";
import { useNavigate } from "react-router-dom";
import { FormatRupiah } from "../utils";

function CardProduct({ data }) {
  const productData = data;
  const imgProduct = `http://localhost:8000/public/products/${productData.Variant.Product.picture}`;
  const navigate = useNavigate();
  const handleClick = (value) => {
    navigate(value);
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div
      className="cards"
      role="button"
      onClick={() => handleClick(`/product/${productData.id}`)}
    >
      <div className="card-img">
        {productData.Variant.Product.picture ? (
          <img className="card-img-product" src={imgProduct} alt={imgProduct} />
        ) : (
          <img
            src={process.env.PUBLIC_URL + "/assets/no-img-product.jpg"}
            alt="no-img-product"
            className="card-img-product"
          />
        )}
      </div>
      <div className="card-body p-2">
        <div>
          <label className="text-label title-product">
            {productData.Variant.Product.model}
          </label>
          <label className="text-secondary text-note">
            <FormatRupiah number={productData.Variant.price} />
          </label>
        </div>
        <div className="d-flex align-items-center">
          <img
            src={process.env.PUBLIC_URL + "/assets/star-full-icon.svg"}
            alt="star-full-icon"
            className="icons"
          />
          <label className="text-normal">
            &nbsp;{productData.rating.toFixed(1)}
          </label>
          <label className="text-normal">
            &nbsp;| {productData.sold} terjual
          </label>
        </div>
      </div>
    </div>
  );
}

export default CardProduct;
