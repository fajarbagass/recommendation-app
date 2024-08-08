import React, { useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";

function ModalEditBrand(props) {
  const id = props.data.id;
  const [name, setName] = useState(props.data.name);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleEditBrand = async (e) => {
    e.preventDefault();
    const data = {
      name: name,
    };
    try {
      await axios.put(`http://localhost:8000/api/v1/auth/brand/${id}`, data, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      alert("Berhasil !\nData brand berhasil diperbarui.");
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
        <form onSubmit={handleEditBrand}>
          <Modal.Header closeButton>
            <div className="d-flex justify-content-center w-100">
              <Modal.Title className="text-title">Data Brand</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <label className="text-label">Nama</label>
            <input
              className="form-control text-normal"
              type="text"
              placeholder="..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
export default ModalEditBrand;
