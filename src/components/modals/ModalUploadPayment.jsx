import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Modal } from "react-bootstrap";

function ModalUploadPayment(props) {
  const proofImage = props.data.proof_image;
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [picture, setPicture] = useState("");
  const [preview, setPreview] = useState("");
  const { id } = useParams();

  const handleFile = (e) => {
    e.preventDefault();
    document.getElementById("getFile").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPayment = async (e) => {
    e.preventDefault();
    const form = new FormData();
    if (picture) {
      form.append("proof_image", picture);
      form.append("status", "Menunggu Konfirmasi");
    } else {
      alert("Gagal !\nUpload bukti pembayaran terlebih dahulu.");
      return;
    }
    try {
      await axios.patch(`http://localhost:8000/api/v1/auth/order/${id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Berhasil !\nBukti pembayaran berhasil diupload.");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      throw err;
    }
  };
  useEffect(() => {
    if (proofImage) {
      setPicture(proofImage);
    }
  }, [proofImage]);

  return (
    <>
      <button
        className="btn btn-dark text-btn"
        type="button"
        onClick={handleShow}
      >
        {proofImage ? <>Lihat</> : <>Upload</>}
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <form onSubmit={handleUploadPayment}>
          <Modal.Header closeButton>
            <div className="d-flex justify-content-center w-100">
              <Modal.Title className="text-title">Bukti Pembayaran</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column align-items-center">
              {picture ? (
                <div className="square-payment">
                  {preview ? (
                    <img
                      id="image"
                      src={preview}
                      alt={preview}
                      className="input-picture"
                    />
                  ) : (
                    <img
                      id="image"
                      src={`http://localhost:8000/public/payments/${picture}`}
                      alt={picture}
                      className="input-picture"
                    />
                  )}
                </div>
              ) : (
                <div className="square-input-picture">
                  <div className="input-picture text-center text-label">
                    Bukti Pembayaran
                  </div>
                </div>
              )}
              {!proofImage ? (
                <div className="my-3">
                  <button
                    onClick={handleFile}
                    className="btn btn-dark text-btn px-5"
                  >
                    Upload Foto
                  </button>
                  <input
                    type="file"
                    id="getFile"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              ) : null}
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
            {!proofImage ? (
              <button type="submit" className="btn btn-dark text-btn">
                SIMPAN
              </button>
            ) : null}
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
export default ModalUploadPayment;
