import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";

function ModalEditOrder(props) {
  const status = props.order.status;
  const code = props.order.code;
  const id = props.order.id;
  const [selectedStatus, setSelectedStatus] = useState("");
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    const data = {
      status: selectedStatus,
    };
    try {
      if (selectedStatus === "Pesanan Diterima") {
        const orderItemRes = await axios.get(
          `http://localhost:8000/api/v1/auth/order-item/order/${id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const orderItemData = orderItemRes.data.data;
        orderItemData.forEach((item) => {
          const quantity = {
            stock: item.Variant.stock - item.quantity,
          };
          axios.put(
            `http://localhost:8000/api/v1/auth/variant/stock/${item.Variant.id}`,
            quantity,
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            }
          );
        });
      }
      await axios.put(`http://localhost:8000/api/v1/auth/order/${id}`, data, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (status === "Menunggu Pembayaran") {
      setSelectedStatus("Pesanan Dibatalkan");
    } else if (status === "Menunggu Konfirmasi") {
      setSelectedStatus("Dikemas");
    } else if (status === "Dikemas") {
      setSelectedStatus("Dalam Pengiriman");
    } else if (status === "Dalam Pengiriman") {
      setSelectedStatus("Terkirim");
    } else if (status === "Terkirim") {
      setSelectedStatus("Pesanan Diterima");
    }
  }, [status]);
  return (
    <>
      <button
        className="btn btn-dark text-btn mt-2"
        type="button"
        onClick={handleShow}
      >
        {status === "Menunggu Pembayaran" ? (
          <>Batalkan Pesanan</>
        ) : status === "Menunggu Konfirmasi" ||
          status === "Dikemas" ||
          status === "Dalam Pengiriman" ? (
          <>Ubah Status Pesanan</>
        ) : status === "Terkirim" ? (
          <>Pesanan Diterima</>
        ) : null}
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <form onSubmit={handleUpdateStatus}>
          <Modal.Header closeButton>
            <div className="d-flex justify-content-center w-100">
              <Modal.Title className="text-title">
                Ubah Status Pesanan
              </Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="border-top border-bottom bg-light p-2">
              <label className="text-label">No. Pesanan : {code}</label>
            </div>
            <div className="p-2">
              <p className="text-normal">
                Status pesanan saat ini adalah <strong>{status}</strong>.
                <br />
                {status === "Menunggu Pembayaran" ? (
                  <>Apakah anda yakin ingin membatalkan pesanan?</>
                ) : status === "Menunggu Konfirmasi" ||
                  status === "Dikemas" ||
                  status === "Dalam Pengiriman" ? (
                  <>
                    Apakah anda yakin ingin mengubah status pesanan
                    menjadi&nbsp;
                    <strong>
                      {status === "Menunggu Konfirmasi" ? (
                        <>Dikemas</>
                      ) : status === "Dikemas" ? (
                        <>Dalam Pengiriman</>
                      ) : status === "Dalam Pengiriman" ? (
                        <>Terkirim</>
                      ) : null}
                    </strong>
                    &nbsp;?
                  </>
                ) : status === "Terkirim" ? (
                  <>Apakah anda yakin ingin menyelesaikan pesanan?</>
                ) : null}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary text-btn"
            >
              TIDAK
            </button>
            <button type="submit" className="btn btn-dark text-btn">
              YA
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
export default ModalEditOrder;
