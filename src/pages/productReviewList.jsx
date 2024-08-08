import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../components";
import { StarRating } from "../utils";

function ProductReviewList() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const findReviewData = useCallback(async () => {
    try {
      const productId = parseInt(id, 10);
      const reviewsResponse = await axios.get(
        `http://localhost:8000/api/v1/review`
      );
      const reviews = reviewsResponse.data.data;
      const reviewProduct = reviews
        .filter((review) => review.Order_item.Variant.Product.id === productId)
        .sort((a, b) => b.id - a.id);
      setReviews(reviewProduct);
    } catch (error) {
      console.error("Error fetching review data:", error);
    }
  }, [id]);

  useEffect(() => {
    findReviewData();
  }, [findReviewData]);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="d-flex flex-column gap-3 py-3">
          {reviews.map((data) => {
            return (
              <div key={data.id} className="border-bottom pb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="circle-img-profile">
                    <img
                      id="image"
                      src={`http://localhost:8000/public/users/${data.Order_item.Order.User.picture}`}
                      alt={data.Order_item.Order.User.picture}
                      className="input-picture"
                    />
                  </div>
                  <label className="text-label">
                    {data.Order_item.Order.User.name}
                  </label>
                </div>
                <div>
                  <label className="text-normal text-secondary">
                    Variasi :&nbsp;
                    {data.Order_item.Variant.ram +
                      "/" +
                      data.Order_item.Variant.storage +
                      ", " +
                      data.Order_item.Variant.color}
                  </label>
                </div>
                <div className="d-flex flex-column gap-2">
                  <StarRating value={data.rating} />
                  <label className="text-normal">{data.review}</label>
                  {data.picture ? (
                    <div className="square-img-review">
                      <img
                        id="image"
                        src={`http://localhost:8000/public/reviews/${data.picture}`}
                        alt={data.picture}
                        className="img-review"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default ProductReviewList;
