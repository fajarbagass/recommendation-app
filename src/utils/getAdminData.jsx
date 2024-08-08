import { useState, useEffect } from "react";
import axios from "axios";

function GetAdminData() {
  const [admin, setAdmin] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/auth/user-list`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      const usersData = res.data.data;
      const adminUser = usersData.find((data) => data.role === "admin");
      setAdmin(adminUser);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return admin;
}
export default GetAdminData;
