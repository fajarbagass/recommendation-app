import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavbarLabel } from "../components";

function UserList() {
  const [users, setUsers] = useState([]);

  const getAllUser = async () => {
    await axios
      .get(`http://localhost:8000/api/v1/auth/user-list`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => {
        const arrUsers = res.data.data.filter((data) => data.role !== "admin");
        setUsers(arrUsers);
      });
  };

  useEffect(() => {
    getAllUser();
  }, []);
  return (
    <>
      <NavbarLabel label={"DATA PENGGUNA"} />
      <div className="container py-4">
        <div className="table-data">
          <table className="table table-striped">
            <thead>
              <tr className="table-dark text-table">
                <th>No</th>
                <th>Profil</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Nomor Telepon</th>
                <th>Alamat</th>
              </tr>
            </thead>
            <tbody>
              {users.length !== 0 ? (
                <>
                  {users.map((data, index) => {
                    return (
                      <tr key={data.id} className="text-no">
                        <td>{index + 1}.</td>
                        <td>
                          <div className="square-img-list">
                            {data.picture ? (
                              <img
                                className="img-list"
                                src={`http://localhost:8000/public/users/${data.picture}`}
                                alt={data.picture}
                              />
                            ) : (
                              <img
                                src={
                                  process.env.PUBLIC_URL +
                                  "/assets/no-img-profile.png"
                                }
                                alt="no-img-profile"
                                className="img-list"
                              />
                            )}
                          </div>
                        </td>
                        <td>{data.name}</td>
                        <td>{data.email ? <>{data.email}</> : <>-</>}</td>
                        <td>{data.phone_number}</td>
                        <td className="w-25">
                          {data.address ? <>{data.address}</> : <>-</>}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ) : (
                <tr className="text-center">
                  <td colSpan={6}>Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UserList;
