import { useState, useEffect } from "react";
import axios from "axios";

function FindProductAvailable() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  const fetchData = async () => {
    try {
      const productsResponse = await axios.get(
        "http://localhost:8000/api/v1/product"
      );
      const arrProducts = productsResponse.data.data;

      const variantsPromises = arrProducts.map((product) =>
        axios.get(`http://localhost:8000/api/v1/variant/product/${product.id}`)
      );
      const ordersPromise = axios.get(
        "http://localhost:8000/api/v1/order-item"
      );
      const reviewsPromise = axios.get("http://localhost:8000/api/v1/review");

      const [variantsResponses, ordersResponse, reviewsResponse] =
        await Promise.all([
          Promise.all(variantsPromises),
          ordersPromise,
          reviewsPromise,
        ]);

      const orders = ordersResponse.data.data;
      const reviews = reviewsResponse.data.data;

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
          const sold = orders
            .filter(
              (order) =>
                order.Variant.Product.id === product.id &&
                order.Order.status === "Pesanan Diterima"
            )
            .reduce((sum, order) => sum + order.quantity, 0);

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

      setFilteredProducts(productData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return filteredProducts;
}

export default FindProductAvailable;
