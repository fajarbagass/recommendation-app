import React, { useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";

function ModalEditVariant(props) {
  const [product, setProduct] = useState(
    props.variant.Product !== null ? props.variant.Product.id : ""
  );
  const [ram, setRam] = useState(props.variant.ram);
  const [storage, setStorage] = useState(props.variant.storage);
  const [color, setColor] = useState(props.variant.color);
  const [price, setPrice] = useState(props.variant.price);
  const [stock, setStock] = useState(props.variant.stock);
  const productsData = props.products;
  const id = props.variant.id;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleEditVariant = async (e) => {
    e.preventDefault();
    const data = {
      product_id: product,
      ram: ram,
      storage: storage,
      color: color,
      price: price,
      stock: stock,
    };
    try {
      await axios.put(`http://localhost:8000/api/v1/auth/variant/${id}`, data, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      alert("Berhasil !\nData variasi berhasil dipebarui.");
      window.location.reload();
    } catch (err) {
      const error = err.response.data.message;
      error.forEach((msg) => {
        alert("Gagal !\n" + msg);
      });
    }
  };

  return (
    <>
      <div role="button" onClick={handleShow}>
        <img
          src={process.env.PUBLIC_URL + "/assets/edit-icon.svg"}
          alt="edit-icon"
          className="icons"
        />
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <form onSubmit={handleEditVariant}>
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
                {productsData.map((data) => {
                  return (
                    <option key={data.id} value={data.id}>
                      {data.model}
                    </option>
                  );
                })}
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
export default ModalEditVariant;
