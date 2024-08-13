import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FormatRupiah, GetCurrentUser, StarRating } from "../utils";
import { Navbar } from "../components";
import { ContentBased } from "../method";

function ProductDetail() {
  const { id } = useParams();
  const user = GetCurrentUser();
  const [product, setProduct] = useState({});
  const [arrVariant, setArrVariant] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState({});
  const [priceRange, setPriceRange] = useState("");
  const [variantRamStorage, setVariantRamStorage] = useState([]);
  const [variantColor, setVariantColor] = useState([]);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedRamStorage, setSelectedRamStorage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedOptions, setSelectedOptions] = useState("specification");

  const navigate = useNavigate();

  const findProduct = useCallback(async () => {
    try {
      const productResponse = await axios.get(
        `http://localhost:8000/api/v1/product/${id}`
      );
      const product = productResponse.data.data;

      const [ordersResponse, reviewsResponse] = await Promise.all([
        axios.get("http://localhost:8000/api/v1/order-item"),
        axios.get("http://localhost:8000/api/v1/review"),
      ]);

      const orders = ordersResponse.data.data;
      const reviews = reviewsResponse.data.data;

      const sold = orders
        .filter((order) => order.Variant.Product.id === product.id)
        .reduce((sum, order) => sum + order.quantity, 0);

      const relevantReviews = reviews.filter(
        (review) => review.Order_item.Variant.Product.id === product.id
      );
      const ratingSum = relevantReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const reviewCount = relevantReviews.length;
      const rating = reviewCount > 0 ? ratingSum / reviewCount : 0;

      const productData = {
        ...product,
        sold: sold,
        rating: rating,
      };
      setProduct(productData);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  }, [id]);
  const reviewsData = useCallback(async () => {
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
      setSelectedReview(reviewProduct[0]);
    } catch (error) {
      console.error("Error fetching review data:", error);
    }
  }, [id]);
  // mencari data variasi produk
  const getVariantProduct = useCallback(async () => {
    const res = await axios.get(
      `http://localhost:8000/api/v1/variant/product/${id}`
    );
    const filteredData = res.data.data.filter((data) => data.stock > 0);

    const ramStorage = [
      ...new Map(
        filteredData.map((data) => [
          `${data.ram}/${data.storage}`,
          { id: data.id, ram: data.ram, storage: data.storage },
        ])
      ).values(),
    ];
    const prices = filteredData.map((item) => item.price);
    const range = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };
    setPriceRange(range);
    setArrVariant(filteredData);
    setVariantRamStorage(ramStorage);
  }, [id]);
  // mengatur pilihan ram/storage
  const handleSelectedRamStorage = (value) => {
    setSelectedRamStorage(value);
    // filter data warna berdasarkan ram dan storage yg dipilih
    const { ram, storage } = value;
    const filterColors = arrVariant
      .filter((data) => data.ram === ram && data.storage === storage)
      .map((data) => ({
        id: data.id,
        color: data.color,
      }));

    const colorData = Array.from(
      new Map(filterColors.map((item) => [item.color, item])).values()
    );
    setVariantColor(colorData);
    setSelectedColor("");
    setSelectedVariant("");
  };
  //mengatur pilihan warna
  const handleSelectedColor = (value) => {
    setSelectedColor(value);
    const { color } = value;
    const filterVariant = arrVariant.find(
      (data) =>
        data.color === color &&
        data.ram === selectedRamStorage.ram &&
        data.storage === selectedRamStorage.storage
    );
    setSelectedVariant(filterVariant);
    if (selectedVariant.stock <= orderQuantity) {
      setOrderQuantity(1);
    }
  };
  // mengatur jumlah order
  const handleAddQuantity = () => {
    if (selectedVariant) {
      if (orderQuantity <= selectedVariant.stock - 1) {
        setOrderQuantity((prevQuantity) => prevQuantity + 1);
      } else {
        setOrderQuantity(1);
      }
    }
  };
  const handleSubtractQuantity = () => {
    if (selectedVariant) {
      if (orderQuantity >= 2)
        setOrderQuantity((prevQuantity) => prevQuantity - 1);
    }
  };
  // mengatur opsi deskripsi
  const handleOptions = (value) => {
    setSelectedOptions(value);
  };
  // mengatur tombol tambah keranjang
  const handleCart = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/account/login");
      alert("Peringatan !\nAnda perlu masuk ke akun anda.");
      return;
    } else {
      if (
        !user.name ||
        !user.phone_number ||
        !user.birth_date ||
        !user.email ||
        !user.address ||
        user.address === "null" ||
        !user.picture
      ) {
        alert("Peringatan !\nAnda belum melengkapi data akun.");
        navigate("/account/user");
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/auth/cart/user`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const isVariantInCart = res.data.data.some(
          (data) =>
            data.Variant.id === selectedVariant.id && data.User.id === user.id
        );
        if (isVariantInCart) {
          alert("Peringatan !\nProduk telah ditambahkan ke keranjang.");
          return;
        }
        if (orderQuantity >= selectedVariant.stock + 1) {
          alert("Peringatan !\nJumlah order melebihi stok produk.");
          return;
        }
        const data = {
          user_id: user.id,
          variant_id: selectedVariant.id,
          quantity: orderQuantity,
        };
        await axios.post(`http://localhost:8000/api/v1/auth/cart`, data, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        alert("Berhasil !\nProduk berhasil ditambahkan ke keranjang.");
      } catch (error) {
        alert("Gagal !\nPilih variasi produk dengan benar.");
      }
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/account/login");
      alert("Peringatan !\nAnda perlu masuk ke akun anda.");
      return;
    } else {
      if (
        !user.name ||
        !user.phone_number ||
        !user.birth_date ||
        !user.email ||
        !user.address ||
        user.address === "null" ||
        !user.picture
      ) {
        alert("Peringatan !\nAnda belum melengkapi data akun.");
        navigate("/account/user");
        return;
      }
      if (orderQuantity >= selectedVariant.stock + 1) {
        alert("Peringatan !\nJumlah order melebihi stok produk.");
        return;
      }
      if (selectedVariant) {
        const purchasedItem = `${selectedVariant.id}, ${orderQuantity}`;
        localStorage.setItem("purchasedItem", purchasedItem);
        localStorage.removeItem("orderItems");
        navigate("/checkout");
      } else {
        alert("Gagal !\nPilih variasi produk dengan benar.");
      }
    }
  };

  const [transform, setTransform] = useState("translate(-50%, -50%) scale(1)");
  const handleZoomIn = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setTransform(`translate(-${xPercent}%, -${yPercent}%) scale(2)`);
  };
  const handleZoomOut = () => {
    setTransform("translate(-50%, -50%) scale(1)");
  };

  useEffect(() => {
    findProduct();
    reviewsData();
    getVariantProduct();
    window.scrollTo(0, 0);
  }, [findProduct, reviewsData, getVariantProduct]);
  return (
    <>
      <Navbar />
      <div className="container pb-5">
        <div className="product-detail py-3">
          <div className="square-img-product">
            {product.picture ? (
              <img
                src={`http://localhost:8000/public/products/${product.picture}`}
                alt={product.picture}
                className="img-product"
                style={{ transform }}
                onMouseMove={handleZoomIn}
                onMouseLeave={handleZoomOut}
              />
            ) : (
              <img
                src={process.env.PUBLIC_URL + "/assets/no-img-product.jpg"}
                alt="no-img-product"
                className="img-product"
              />
            )}
          </div>
          <div className="product-content">
            <div className="d-flex flex-column">
              <label className="text-title-lg">{product.model}</label>
              <div className="d-flex align-items-center mb-2">
                <StarRating value={product.rating} />
                <label className="text-label">
                  &nbsp;| {product.sold} terjual
                </label>
              </div>
              <label className="text-label text-secondary">
                <>
                  {selectedVariant ? (
                    <>
                      Harga <FormatRupiah number={selectedVariant.price} />
                    </>
                  ) : (
                    <>
                      Mulai Dari&nbsp;
                      {priceRange ? (
                        <>
                          {priceRange.min === priceRange.max ? (
                            <FormatRupiah number={priceRange.min} />
                          ) : (
                            <>
                              <FormatRupiah number={priceRange.min} />
                              &nbsp;-&nbsp;
                              <FormatRupiah number={priceRange.max} />
                            </>
                          )}
                        </>
                      ) : null}
                    </>
                  )}
                </>
              </label>
            </div>
            <label className="text-label mt-4">Pilih Variasi:</label>
            <div className="d-flex flex-column ps-2">
              {/* Harga */}
              <table className="border-0">
                <tbody>
                  <tr>
                    <td className="text-label text-secondary w-25">
                      Ram/Storage
                    </td>
                    <td className="text-normal d-flex flex-row flex-wrap gap-2 ps-2 mb-2">
                      {variantRamStorage.length !== 0 ? (
                        <>
                          {variantRamStorage.map((data) => {
                            return (
                              <div
                                key={data.id}
                                className="btn-variant"
                                style={{
                                  background:
                                    selectedRamStorage === data
                                      ? "#d3d3d3"
                                      : "#f2f3f4",
                                }}
                                role="button"
                                onClick={() => handleSelectedRamStorage(data)}
                              >
                                {data.ram}/{data.storage}
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <>-</>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-label text-secondary w-25">Warna</td>
                    <td className="text-normal d-flex flex-row flex-wrap gap-2 ps-2 mb-2">
                      {variantColor.length !== 0 ? (
                        <>
                          {variantColor.map((data) => {
                            return (
                              <div
                                key={data.id}
                                className="btn-variant"
                                style={{
                                  background:
                                    selectedColor === data
                                      ? "#d3d3d3"
                                      : "#f2f3f4",
                                }}
                                role="button"
                                onClick={() => handleSelectedColor(data)}
                              >
                                {data.color}
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <div>-</div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-label text-secondary w-25">Stok</td>
                    <td className="text-normal ps-2 mb-2">
                      {selectedColor ? <>{selectedVariant.stock}</> : <>-</>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="d-flex mt-4">
              <label className="text-label w-25">Jumlah Order:</label>
              <div className="d-flex align-items-center ps-3">
                <div role="button" onClick={handleSubtractQuantity}>
                  <img
                    src={process.env.PUBLIC_URL + "/assets/minus-btn-icon.svg"}
                    alt="minus-btn-icon"
                    className="icons"
                  />
                </div>
                <div
                  className="text-center text-normal"
                  style={{ width: "76px" }}
                >
                  {orderQuantity}
                </div>
                <div role="button" onClick={handleAddQuantity}>
                  <img
                    src={process.env.PUBLIC_URL + "/assets/plus-btn-icon.svg"}
                    alt="plus-btn-icon"
                    className="icons"
                  />
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 text-btn mt-4">
              {user && user.role === "admin" ? (
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => navigate(`/account/edit-product/${id}`)}
                >
                  Edit Produk
                </button>
              ) : (
                <>
                  <div
                    role="button"
                    className="btn btn-secondary"
                    onClick={handleCart}
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/assets/plus-icon.svg"}
                      alt="plus-icon"
                      className="icons"
                    />
                    &nbsp;Keranjang
                  </div>
                  <div
                    role="button"
                    onClick={handleBuyNow}
                    className="btn btn-dark"
                  >
                    Beli Sekarang
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="title-card-list">
            <label className="text-title-list">Produk serupa</label>
          </div>
          <ContentBased id={product.id} />
        </div>
        <div className="product-desc">
          <div className="product-menu gap-3 text-label">
            <div
              role="button"
              onClick={() => handleOptions("specification")}
              className="product-menu-list"
            >
              Spesifikasi
            </div>
            <div>|</div>
            <div
              role="button"
              onClick={() => handleOptions("description")}
              className="product-menu-list"
            >
              Deskripsi
            </div>
          </div>
          <div className="d-flex p-2">
            {selectedOptions === "specification" ? (
              <table className="border-0 w-100">
                <tbody>
                  <tr>
                    <td className="text-label w-25">Brand</td>
                    <td className="text-normal">
                      : {product.Brand ? <>{product.Brand.name}</> : <>-</>}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Model</td>
                    <td className="text-normal">: {product.model}</td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Sistem Operasi</td>
                    <td className="text-normal">: {product.os}</td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Prosessor</td>
                    <td className="text-normal">: {product.chipset}</td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Layar</td>
                    <td className="text-normal">: {product.display}</td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Kamera</td>
                    <td className="text-normal">: {product.camera}</td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Batterai</td>
                    <td className="text-normal">: {product.battery}</td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Jaringan</td>
                    <td className="text-normal">: {product.network}</td>
                  </tr>
                  <tr>
                    <td className="text-label w-25">Charger</td>
                    <td className="text-normal">: {product.charging}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div>
                <label className="text-label mb-2">Deskripsi Produk :</label>
                <pre
                  className="text-normal"
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {product.description !== null ? (
                    <>{product.description}</>
                  ) : (
                    <>-</>
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
        <div className="py-3">
          <label className="text-title">Ulasan Pembeli</label>
          <div className="d-flex justify-content-between">
            <div className="d-flex align-items-center mb-2">
              <img
                src={process.env.PUBLIC_URL + "/assets/star-full-icon.svg"}
                alt="star-full-icon"
                className="icons"
              />
              <label className="text-normal">
                {product && product.rating !== undefined && (
                  <>&nbsp;{product.rating.toFixed(1)}/5.0</>
                )}
              </label>
              <label className="text-note ms-2">
                {reviews ? (
                  <>
                    &#40; {reviews.length} rating&nbsp;.&nbsp;
                    {reviews.filter((data) => data.review).length} ulasan &#41;
                  </>
                ) : null}
              </label>
            </div>
            {selectedReview ? (
              <label
                role="button"
                onClick={() => navigate(`/product/review/${product.id}`)}
                className="text-label"
              >
                Lihat Semua
              </label>
            ) : null}
          </div>
          <div className="border-top p-2 d-flex flex-column">
            {selectedReview ? (
              <>
                {selectedReview.Order_item ? (
                  <>
                    <div className="d-flex align-items-center gap-2">
                      <div className="circle-img-profile">
                        <img
                          id="image"
                          src={`http://localhost:8000/public/users/${selectedReview.Order_item.Order.User.picture}`}
                          alt={selectedReview.Order_item.Order.User.picture}
                          className="input-picture"
                        />
                      </div>
                      <label className="text-label">
                        {selectedReview.Order_item.Order.User.name}
                      </label>
                    </div>
                    <div>
                      <label className="text-normal text-secondary">
                        Variasi :&nbsp;
                        {selectedReview.Order_item.Variant.ram +
                          "/" +
                          selectedReview.Order_item.Variant.storage +
                          ", " +
                          selectedReview.Order_item.Variant.color}
                      </label>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <StarRating value={selectedReview.rating} />
                      <label className="text-normal">
                        {selectedReview.review}
                      </label>
                      {selectedReview.picture ? (
                        <div className="square-img-review">
                          <img
                            id="image"
                            src={`http://localhost:8000/public/reviews/${selectedReview.picture}`}
                            alt={selectedReview.picture}
                            className="img-review"
                          />
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
