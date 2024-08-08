import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GetCurrentUser, FindProductAvailable } from "../utils";
import { CardProduct } from "../components";

function Collaborative() {
  // Mendapatkan data pengguna saat ini
  const user = GetCurrentUser();
  // State untuk menyimpan daftar pengguna, ulasan, hasil produk, dan hasil produk lainnya
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [productResult, setProductResult] = useState([]);
  const [moreProductResult, setMoreProductResult] = useState([]);
  // Daftar produk yang tersedia
  const availableProducts = FindProductAvailable();
  // State untuk mengecek apakah produk sudah dimuat
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  // State untuk mengecek apakah user sudah login
  const token = localStorage.getItem("token");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fungsi untuk mengambil data pengguna dan ulasan dari API
  const fetchData = async () => {
    // Mengambil data pengguna
    const usersResponse = await axios.get(
      "http://localhost:8000/api/v1/auth/user-list",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    const usersData = usersResponse.data.data.filter(
      (user) => user.role !== "admin"
    );
    setUsers(usersData);

    // Mengambil data ulasan
    const reviewsResponse = await axios.get(
      "http://localhost:8000/api/v1/review"
    );
    const reviewsData = reviewsResponse.data.data;
    setReviews(reviewsData);

    // Menandai bahwa produk telah dimuat
    setIsProductsLoaded(true);
  };

  // Fungsi untuk menghitung dan memprediksi rating menggunakan Collaborative Filtering
  const calculateCollaborativeFiltering = useCallback(async () => {
    // Mengubah ulasan menjadi format yang lebih mudah untuk diproses
    const formattedReviews = reviews.map((review) => {
      const user = users.find(
        (user) => review.Order_item.Order.User.id === user.id
      );
      return {
        userId: user ? user.id : null,
        productId: review.Order_item.Variant.Product.id,
        rating: review.rating,
      };
    });

    // Mengelompokkan ulasan berdasarkan userId dan productId
    const groupedReviews = formattedReviews.reduce((result, review) => {
      const key = `${review.userId}-${review.productId}`;
      if (!result[key]) {
        result[key] = {
          userId: review.userId,
          productId: review.productId,
          totalRating: 0,
          count: 0,
        };
      }
      result[key].totalRating += review.rating;
      result[key].count++;
      return result;
    }, {});

    // Menghitung rata-rata rating untuk setiap kombinasi userId dan productId
    const averageRatings = Object.values(groupedReviews).map((group) => {
      return {
        userId: group.userId,
        productId: group.productId,
        averageRating: group.totalRating / group.count,
      };
    });

    // Mengatur kombinasi userId dan productId yang ada
    const userIdSet = new Set();
    averageRatings.forEach(({ userId }) => userIdSet.add(userId));
    const productIdSet = new Set();
    averageRatings.forEach(({ productId }) => productIdSet.add(productId));
    const existingCombinations = new Set(
      averageRatings.map(({ userId, productId }) => `${userId}-${productId}`)
    );

    // Menambahkan kombinasi yang tidak ada dengan rating 0
    userIdSet.forEach((userId) => {
      productIdSet.forEach((productId) => {
        const combination = `${userId}-${productId}`;
        if (!existingCombinations.has(combination)) {
          averageRatings.push({ userId, productId, averageRating: 0 });
        }
      });
    });

    // Mengurutkan rata-rata rating berdasarkan userId dan productId
    averageRatings.sort((a, b) => {
      if (a.userId === b.userId) {
        return a.productId - b.productId;
      }
      return a.userId - b.userId;
    });

    // Mengelompokkan rating produk berdasarkan productId
    const productRatings = {};
    averageRatings.forEach(({ userId, productId, averageRating }) => {
      if (!productRatings[productId]) {
        productRatings[productId] = {};
      }
      productRatings[productId][userId] = averageRating;
    });

    // Fungsi untuk menghitung kemiripan kosinus antara dua produk
    function cosineSimilarity(product1, product2) {
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;
      for (const userId in product1) {
        if (product2[userId]) {
          dotProduct += product1[userId] * product2[userId];
        }
        norm1 += product1[userId] ** 2;
      }
      for (const userId in product2) {
        norm2 += product2[userId] ** 2;
      }
      norm1 = Math.sqrt(norm1);
      norm2 = Math.sqrt(norm2);
      return dotProduct / (norm1 * norm2);
    }

    // Menghitung kemiripan antara setiap pasangan produk
    const productIds = Object.keys(productRatings);
    const similarityResults = [];
    for (let i = 0; i < productIds.length; i++) {
      for (let j = i; j < productIds.length; j++) {
        const productId1 = productIds[i];
        const productId2 = productIds[j];
        const similarity =
          productId1 === productId2
            ? 1
            : cosineSimilarity(
                productRatings[productId1],
                productRatings[productId2]
              );
        similarityResults.push({
          productId1: productId1,
          productId2: productId2,
          similarity: similarity,
        });
      }
    }

    // Mendapatkan userId pengguna yang akan diprediksi
    const userIdToPredict = user.id;
    const userRatings = [];
    const productIdsToPredict = [];
    averageRatings.forEach((data) => {
      if (data.userId === user.id) {
        userRatings.push(data);
        productIdsToPredict.push(`${data.productId}`);
      }
    });

    // Fungsi untuk memprediksi rating berdasarkan kemiripan produk
    function predictRating(productId, similarityResults, userRatings) {
      let numerator = 0;
      let denominator = 0;
      userRatings.forEach((rating) => {
        const { productId: ratedProductId, averageRating } = rating;
        if (productId === ratedProductId) {
          numerator += averageRating;
          return;
        }
        const similarityObj = similarityResults.find(
          (result) =>
            (result.productId1 === productId &&
              +result.productId2 === ratedProductId) ||
            (+result.productId1 === ratedProductId &&
              result.productId2 === productId)
        );
        if (
          similarityObj &&
          (similarityObj.productId1 !== productId ||
            similarityObj.productId2 !== productId)
        ) {
          const similarity = similarityObj.similarity;
          numerator += similarity * averageRating;
          denominator += similarity;
        }
      });
      if (denominator === 0) {
        return 0;
      }
      return numerator / denominator;
    }

    // Memprediksi rating untuk setiap produk yang akan diprediksi
    const predictions = [];
    productIdsToPredict.forEach((productId) => {
      const prediction = predictRating(
        productId,
        similarityResults,
        userRatings
      );
      predictions.push({
        userId: userIdToPredict,
        productId: productId,
        predictedRating: prediction,
      });
    });

    // Mengelompokkan produk berdasarkan hasil prediksi
    const productCollaborative = [];
    const moreProduct = [];
    availableProducts.forEach((product) => {
      const data = predictions.find((data) => product.id === +data.productId);
      if (data) {
        productCollaborative.push({ ...product, cf: data.predictedRating });
      } else {
        moreProduct.push(product);
      }
    });
    // Mengurutkan hasil berdasarkan dari nilai cf tertinggi dan terjual terbanyak
    productCollaborative.sort((a, b) => b.cf - a.cf);
    moreProduct.sort((a, b) => b.sold - a.sold);
    // Menyimpan hasil produk dan produk lainnya ke dalam state
    setProductResult(productCollaborative);
    setMoreProductResult(moreProduct);
  }, [reviews, users, user, availableProducts]);

  // mengukur panjang data array produk
  const lenProducts = productResult.length;
  // Mengambil data saat komponen pertama kali dirender
  useEffect(() => {
    if (token !== null) {
      setIsLoggedIn(true);
      fetchData();
    } else {
      setIsLoggedIn(false);
    }
  }, [token]);
  // Memulai perhitungan collaborative filtering ketika produk telah dimuat
  useEffect(() => {
    if (isProductsLoaded) {
      calculateCollaborativeFiltering();
    }
  }, [isProductsLoaded, calculateCollaborativeFiltering]);

  return (
    <>
      <div className="mb-4">
        {productResult.length !== 0 && isLoggedIn ? (
          <>
            <div className="title-card-list">
              <label className="text-title-list">Rekomendasi untuk anda</label>
            </div>
            <div className="product-card-list">
              {productResult.length < 6 ? (
                <>
                  {productResult.map((data, index) => {
                    return (
                      <CardProduct key={data.id} data={data} index={index} />
                    );
                  })}
                  {moreProductResult.map((data, index) => {
                    if (index < lenProducts) {
                      return (
                        <CardProduct key={data.id} data={data} index={index} />
                      );
                    } else {
                      return null;
                    }
                  })}
                </>
              ) : (
                <>
                  {productResult.map((data, index) => {
                    if (index < 6) {
                      return (
                        <CardProduct key={data.id} data={data} index={index} />
                      );
                    } else {
                      return null;
                    }
                  })}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default Collaborative;
