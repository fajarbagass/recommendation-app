import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CardProduct } from "../components";

function ContentBased({ id }) {
  // Mendapatkan data id produk saat ini
  const productId = id;
  // State untuk menyimpan daftar produk yang dipilih, produk lainnya, dan hasil produk
  const [selectedProduct, setSelectedProduct] = useState({});
  const [arrProducts, setArrProducts] = useState([]);
  const [productResult, setProductResult] = useState([]);
  // State untuk mengecek apakah produk sudah dimuat
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);

  // Fungsi untuk mendapatkan produk yang dipilih
  const getSelectedProduct = useCallback(async () => {
    try {
      // Mengambil data produk dan varian secara paralel
      const [productResponse, variantResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/v1/product/${productId}`),
        axios.get(`http://localhost:8000/api/v1/variant/product/${productId}`),
      ]);

      // Mengambil atribut dari respon produk
      const {
        model,
        os,
        chipset,
        display,
        camera,
        battery,
        network,
        charging,
        id,
        Brand,
      } = productResponse.data.data;

      // Memeriksa apakah data merek ada dan mendapatkan nama merek
      const brand = Brand ? Brand.name : "";

      // Menggabungkan informasi produk dalam satu string
      const uniqueProduct = `${brand}, ${model}, ${os}, ${chipset}, ${display}, ${camera}, ${battery}, ${charging}, ${network}`;

      // Memfilter varian yang memiliki stok lebih dari 0
      const filteredVariant = variantResponse.data.data.filter(
        (data) => data.stock > 0
      );

      // Fungsi untuk mendapatkan atribut unik dari varian
      const getUniqueAttributes = (attr) =>
        [...new Set(filteredVariant.map((item) => item[attr]))].join(", ");

      // Mendapatkan atribut unik untuk RAM, penyimpanan, dan warna
      const uniqueRams = getUniqueAttributes("ram");
      const uniqueStorages = getUniqueAttributes("storage");
      const uniqueColors = getUniqueAttributes("color");
      const uniquePrices = getUniqueAttributes("price");

      // Menggabungkan informasi varian dalam satu string
      const uniqueVariant = `${uniqueRams}, ${uniqueStorages}, ${uniqueColors}, ${uniquePrices}`;

      // Menggabungkan informasi produk dan varian dalam satu objek
      const resultProduct = {
        id,
        data: `${uniqueProduct}, ${uniqueVariant}`,
      };

      // Menyimpan hasil ke dalam state
      setSelectedProduct(resultProduct);
    } catch (error) {
      // Menangani error jika terjadi masalah dalam pengambilan data produk
      console.error("Error fetching product data:", error);
    }
  }, [productId]);

  // Fungsi untuk mendapatkan semua produk
  const findAllProducts = useCallback(async () => {
    try {
      // Memanggil API untuk mendapatkan data produk
      const productsResponse = await axios.get(
        "http://localhost:8000/api/v1/product"
      );
      const products = productsResponse.data.data;

      // Filter produk yang id-nya tidak sama dengan productId
      const filteredProducts = products.filter((data) => data.id !== productId);

      // Membuat array promise untuk mendapatkan variasi setiap produk
      const variantRequests = filteredProducts.map((data) =>
        axios.get(`http://localhost:8000/api/v1/variant/product/${data.id}`)
      );
      // Menunggu semua request variasi selesai
      const variantResponses = await Promise.all(variantRequests);

      // Memproses data produk dan variasi
      const productVariants = filteredProducts
        .map((product, index) => {
          const variants = variantResponses[index].data.data;
          // Filter variasi yang memiliki stok lebih dari 0
          const validVariants = variants.filter((variant) => variant.stock > 0);

          // Jika tidak ada variasi dengan stok lebih dari 0, kembalikan null
          if (validVariants.length === 0) {
            return null;
          }

          // Fungsi untuk mendapatkan atribut unik
          const getUniqueAttributes = (attr) =>
            [...new Set(validVariants.map((item) => item[attr]))].join(", ");

          const uniqueRams = getUniqueAttributes("ram");
          const uniqueStorages = getUniqueAttributes("storage");
          const uniqueColors = getUniqueAttributes("color");
          const uniquePrices = getUniqueAttributes("price");
          const uniqueVariant = `${uniqueRams}, ${uniqueStorages}, ${uniqueColors}, ${uniquePrices}`;

          // Mengambil atribut produk
          const {
            model,
            os,
            chipset,
            display,
            camera,
            battery,
            charging,
            network,
            Brand,
          } = product;

          // Memeriksa apakah data merek ada
          const brand = Brand ? Brand.name : "";

          // Menggabungkan informasi produk dalam satu string
          const uniqueProduct = `${brand}, ${model}, ${os}, ${chipset}, ${display}, ${camera}, ${battery}, ${charging}, ${network}`;

          return {
            id: product.id,
            Product: product,
            data: `${uniqueProduct}, ${uniqueVariant}`,
          };
        })
        .filter((product) => product !== null); // Hapus produk yang tidak memiliki variasi valid

      // Mengatur state produk dengan variasi
      setArrProducts(productVariants);
      // Mengubah status data produk sudah dimuat
      setIsProductsLoaded(true);
    } catch (error) {
      // Menangani error jika terjadi masalah dalam pengambilan data produk atau variasi
      console.error("Error fetching products or variants:", error);
    }
  }, [productId]);

  // Fungsi untuk menghitung metode tf-idf dan rekomendasi produk
  const calculationContentBasedFiltering = useCallback(async () => {
    const documents = arrProducts.map((item) => {
      // Mengubah data produk menjadi lowercase, menghilangkan tanda baca, dan memisahkan kata-kata
      let data = item.data
        .toLowerCase()
        .replace(/[^\w\s.]/g, "")
        .split(" ");
      data = [...new Set(data)].filter((word) => word.trim() !== "");
      return { ...item, data };
    });

    // Menentukan term dari produk yang dipilih
    const vocabulary = selectedProduct.data
      .toLowerCase()
      .replace(/[^\w\s.]/g, "")
      .split(" ")
      .filter((word) => word.trim() !== "")
      .reduce((uniqueWords, word) => {
        if (!uniqueWords.has(word)) {
          uniqueWords.add(word);
        }
        return uniqueWords;
      }, new Set()); // Menggunakan Set untuk memastikan kata unik

    // Mengubah Set kembali menjadi array
    const vocabularyArray = [...vocabulary];

    // Perhitungan tf (term frequency)
    const tf = documents.map((doc) => {
      const termFrequency = {};
      vocabularyArray.forEach((term) => {
        termFrequency[term] = doc.data.filter((word) => word === term).length;
      });
      return { productId: doc.id, data: termFrequency };
    });

    // Menghitung df (document frequency)
    const documentFrequency = {};
    vocabularyArray.forEach((term) => {
      let count = 0;
      documents.forEach((doc) => {
        if (doc.data.includes(term)) {
          count++;
        }
      });
      documentFrequency[term] = count;
    });

    // Menghitung total dokumen
    const totalDocuments = documents.length;

    // Perhitungan idf (inverse document frequency)
    const inverseDocumentFrequency = {};
    Object.keys(documentFrequency).forEach((term) => {
      const dfValue = totalDocuments / documentFrequency[term];
      const idfValue = Math.log10(dfValue);
      inverseDocumentFrequency[term] = isFinite(idfValue) ? idfValue : 0;
    });

    // Perhitungan tf-idf
    const tfidf = tf.map((termFrequency) => {
      const tfidfScore = {};
      Object.keys(termFrequency.data).forEach((term) => {
        tfidfScore[term] =
          termFrequency.data[term] * (inverseDocumentFrequency[term] + 1);
      });
      return { productId: termFrequency.productId, data: tfidfScore };
    });

    // Menjumlahkan nilai tf-idf
    const tfidfResults = tfidf.map((result) => {
      let sum = 0;
      for (const term in result.data) {
        sum += result.data[term];
      }
      return { productId: result.productId, data: sum };
    });

    // Membuat data array produk rekomendasi
    const productRecommendation = await Promise.all(
      tfidfResults
        .sort((a, b) => b.data - a.data)
        .map(async (data) => {
          const product = arrProducts.find(
            (product) => product.id === data.productId
          );

          // Mendapatkan varian produk
          const variantResponse = await axios.get(
            `http://localhost:8000/api/v1/variant/product/${product.id}`
          );
          const variants = variantResponse.data.data;
          const validVariants = variants.filter((variant) => variant.stock > 0);

          // Mendapatkan varian termurah
          const cheapestVariant = validVariants.reduce((prev, curr) => {
            return prev.price < curr.price ? prev : curr;
          }, validVariants[0]);

          // Mendapatkan data order
          const ordersResponse = await axios.get(
            `http://localhost:8000/api/v1/order-item`
          );
          const orders = ordersResponse.data.data.filter(
            (order) =>
              order.Variant.Product.id === product.id &&
              order.Order.status === "Pesanan Diterima"
          );
          const sold = orders.reduce((sum, order) => sum + order.quantity, 0);

          // Mendapatkan data review
          const reviewResponse = await axios.get(
            `http://localhost:8000/api/v1/review`
          );
          const reviews = reviewResponse.data.data.filter(
            (review) => review.Order_item.Variant.Product.id === product.id
          );
          const rating =
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length;

          return {
            id: product.id,
            Variant: cheapestVariant,
            tfidf: data.data,
            sold: sold,
            rating: isNaN(rating) ? 0 : rating,
          };
        })
    );

    // Menyimpan hasil ke dalam state
    setProductResult(productRecommendation);
  }, [arrProducts, selectedProduct]);

  // Mengambil data saat komponen pertama kali dirender
  useEffect(() => {
    if (productId) {
      getSelectedProduct();
      findAllProducts();
    }
  }, [getSelectedProduct, findAllProducts, productId]);

  // Memulai perhitungan content based filtering ketika produk telah dimuat
  useEffect(() => {
    if (isProductsLoaded) {
      calculationContentBasedFiltering();
    }
  }, [isProductsLoaded, calculationContentBasedFiltering]);

  return (
    <>
      <div className="mb-4">
        {productResult ? (
          <div className="product-card-list">
            {productResult.map((data, index) => {
              if (index < 6) {
                return <CardProduct key={data.id} data={data} index={index} />;
              } else {
                return null;
              }
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
export default ContentBased;
