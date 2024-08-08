import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { NavbarLabel } from "../components";
import {
  ModalAddbrand,
  ModalEditBrand,
  ModalAddVariant,
  ModalEditVariant,
} from "../components/modals";
import { FormatRupiah } from "../utils";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variants, setVariants] = useState([]);
  const [options, setOptions] = useState("product");
  const handleOptions = (value) => {
    localStorage.setItem("options", value);
    window.location.reload();
  };

  // get data
  const getAllBrands = async () => {
    await axios.get(`http://localhost:8000/api/v1/brand`).then((res) => {
      const brandData = res.data.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setBrands(brandData);
    });
  };
  const getAllProducts = useCallback(async () => {
    await axios.get(`http://localhost:8000/api/v1/product`).then((res) => {
      setProducts(res.data.data);
    });
    setProducts((prevProducts) => {
      return [...prevProducts].sort((a, b) => {
        if (!a.Brand || !a.Brand.name) return 1;
        if (!b.Brand || !b.Brand.name) return -1;
        return a.Brand.name.localeCompare(b.Brand.name);
      });
    });
  }, []);
  const getAllVariants = useCallback(async () => {
    await axios.get(`http://localhost:8000/api/v1/variant`).then((res) => {
      setVariants(res.data.data);
    });
    setVariants((prevVariants) => {
      return [...prevVariants].sort((a, b) => {
        if (!a.Product || !a.Product.model) return 1;
        if (!b.Product || !b.Product.model) return -1;
        return a.Product.model.localeCompare(b.Product.model);
      });
    });
  }, []);

  // handle button delete
  const handleDeleteBrand = (id) => {
    axios.delete(`http://localhost:8000/api/v1/auth/brand/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    alert("Berhasil !\nData brand berhasil dihapus.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  const handleDeleteProduct = (id) => {
    axios.delete(`http://localhost:8000/api/v1/auth/product/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    alert("Berhasil !\nData produk berhasil dihapus.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  const handleDeleteVariant = (id) => {
    axios.delete(`http://localhost:8000/api/v1/auth/variant/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    alert("Berhasil !\nData variasi berhasil dihapus.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    getAllProducts();
    getAllBrands();
    getAllVariants();
    // mengubah nilai options
    const storedOptions = localStorage.getItem("options");
    if (storedOptions) {
      setOptions(storedOptions);
    }
  }, [getAllProducts, getAllVariants]);
  return (
    <>
      <NavbarLabel label={"DATA PRODUK"} />
      <div className="container pb-5">
        <div className="d-flex flex-column">
          <div className="title-product-list text-title pt-3">
            <div
              className="title-menu"
              role="button"
              onClick={() => handleOptions("brand")}
            >
              Brand
            </div>
            <div
              className="title-menu"
              role="button"
              onClick={() => handleOptions("product")}
            >
              Produk
            </div>
            <div
              className="title-menu"
              role="button"
              onClick={() => handleOptions("variant")}
            >
              Variasi
            </div>
          </div>
          <div className="mt-5 pt-3">
            {options === "brand" ? (
              <div className="d-flex flex-row flex-wrap gap-3">
                {brands.map((data) => {
                  return (
                    <div key={data.id} className="brand-list">
                      <div className="text-label">{data.name}</div>
                      <div>
                        <div className="d-flex flex-row gap-1">
                          <ModalEditBrand data={data} />|
                          <div
                            role="button"
                            onClick={() => handleDeleteBrand(data.id)}
                          >
                            <img
                              src={
                                process.env.PUBLIC_URL +
                                "/assets/trash-icon.svg"
                              }
                              alt="trash-icon"
                              className="icons"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <ModalAddbrand />
              </div>
            ) : options === "product" ? (
              <div>
                <div className="text-end mb-2">
                  <Link to={"/account/add-product"}>
                    <button type="button" className="btn btn-dark text-btn">
                      Tambah Produk
                    </button>
                  </Link>
                </div>
                <div className="table-data">
                  <table className="table table-striped">
                    <thead>
                      <tr className="table-dark text-table">
                        <th>No</th>
                        <th>Gambar</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length !== 0 ? (
                        <>
                          {products.map((data, index) => {
                            return (
                              <tr key={data.id} className="text-normal">
                                <td>{index + 1}.</td>
                                <td>
                                  <div className="square-img-list">
                                    <Link to={`/product/${data.id}`}>
                                      {data.picture ? (
                                        <img
                                          className="img-list"
                                          src={`http://localhost:8000/public/products/${data.picture}`}
                                          alt={data.picture}
                                        />
                                      ) : (
                                        <img
                                          src={
                                            process.env.PUBLIC_URL +
                                            "/assets/no-img-product.jpg"
                                          }
                                          alt="no-img-product"
                                          className="img-list"
                                        />
                                      )}
                                    </Link>
                                  </div>
                                </td>
                                <td>
                                  {data.Brand ? <>{data.Brand.name}</> : <>-</>}
                                </td>
                                <td>{data.model}</td>
                                <td>
                                  <div className="d-flex flex-row gap-2">
                                    <Link
                                      to={`/account/edit-product/${data.id}`}
                                    >
                                      <img
                                        src={
                                          process.env.PUBLIC_URL +
                                          "/assets/edit-icon.svg"
                                        }
                                        alt="edit-icon"
                                        className="icons"
                                      />
                                    </Link>
                                    |
                                    <div
                                      role="button"
                                      onClick={() =>
                                        handleDeleteProduct(data.id)
                                      }
                                    >
                                      <img
                                        src={
                                          process.env.PUBLIC_URL +
                                          "/assets/trash-icon.svg"
                                        }
                                        alt="trash-icon"
                                        className="icons"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      ) : (
                        <tr className="text-center">
                          <td colSpan={5}>Tidak ada data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-end mb-2">
                  <ModalAddVariant products={products} />
                </div>
                <div className="table-data">
                  <table className="table table-striped">
                    <thead>
                      <tr className="table-dark text-table">
                        <th>No</th>
                        {/* <th>Foto</th> */}
                        <th>Model</th>
                        <th>Variasi</th>
                        <th>Warna</th>
                        <th>Harga</th>
                        <th>Stok</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.length !== 0 ? (
                        <>
                          {variants.map((data, index) => {
                            return (
                              <tr key={data.id} className="text-normal">
                                <td>{index + 1}.</td>
                                <td>
                                  {data.Product ? (
                                    <>{data.Product.model}</>
                                  ) : (
                                    <>-</>
                                  )}
                                </td>
                                <td>
                                  {data.ram}/{data.storage}
                                </td>
                                <td>{data.color}</td>
                                <td>
                                  <FormatRupiah number={data.price} />
                                </td>
                                <td>{data.stock}</td>
                                <td>
                                  <div className="d-flex flex-row gap-2">
                                    <ModalEditVariant
                                      variant={data}
                                      products={products}
                                    />
                                    |
                                    <div
                                      role="button"
                                      onClick={() =>
                                        handleDeleteVariant(data.id)
                                      }
                                    >
                                      <img
                                        src={
                                          process.env.PUBLIC_URL +
                                          "/assets/trash-icon.svg"
                                        }
                                        alt="trash-icon"
                                        className="icons"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      ) : (
                        <tr className="text-center">
                          <td colSpan={7}>Tidak ada data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
export default ProductList;
