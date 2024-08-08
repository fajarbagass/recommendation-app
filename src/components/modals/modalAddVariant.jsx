import React, { useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";

function ModalAddVariant(props) {
  const [product, setProduct] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const productsData = props.products;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleAddVariant = async (e) => {
    e.preventDefault();
    const data = {
      product_id: product,
      ram: ram,
      storage: storage,
      color: color,
      price: price,
      stock: stock,
    };
    await axios
      .post(`http://localhost:8000/api/v1/auth/variant`, data, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => {
        const checkProduct = res.data.data.Product;
        if (checkProduct) {
          setProduct(res.data.data.Product.id);
        }
        setRam(res.data.data.ram);
        setStorage(res.data.data.storage);
        setColor(res.data.data.color);
        setPrice(res.data.data.price);
        setStock(res.data.data.stock);
        alert("Berhasil !\nData variasi berhasil ditambahkan.");
        window.location.reload();
      })
      .catch((err) => {
        const error = err.response.data.message;
        error.forEach((msg) => {
          alert("Gagal !\n" + msg);
        });
      });
  };

  return (
    <>
      <button
        className="btn btn-dark text-btn"
        type="button"
        onClick={handleShow}
      >
        Tambah Variasi
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <form onSubmit={handleAddVariant}>
          <Modal.Header closeButton>
            <div className="d-flex justify-content-center w-100">
              <Modal.Title className="text-title">Data Variasi</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="text-secondary">
              <label className="text-label">Model</label>
              <select
                className="form-control text-normal"
                value={product || ""}
                onChange={(e) => {
                  const selected = e.target.value;
                  setProduct(selected);
                }}
              >
                <option value="">...</option>
                {
                  (productsData.sort((a, b) => a.model.localeCompare(b.model)),
                  productsData.map((data) => {
                    return (
                      <option key={data.id} value={data.id}>
                        {data.model}
                      </option>
                    );
                  }))
                }
              </select>
              <label className="text-label mt-2">RAM</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={ram}
                onChange={(e) => setRam(e.target.value)}
              />
              <label className="text-label mt-2">Penyimpanan Internal</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
              />
              <label className="text-label mt-2">Warna</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <label className="text-label mt-2">Harga</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <label className="text-label mt-2">Stok</label>
              <input
                className="form-control text-normal"
                type="text"
                placeholder="..."
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary text-btn"
            >
              KEMBALI
            </button>
            <button type="submit" className="btn btn-dark text-btn">
              SIMPAN
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
export default ModalAddVariant;
