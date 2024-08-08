import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function GetCurrentUser() {
  const [role, setRole] = useState("");
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    if (token) {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/auth/user`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setRole(res.data.data);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("orderItems");
        localStorage.removeItem("purchasedItem");
        window.location.reload();
        throw error;
      }
    } else {
      setRole(null);
    }
  }, [token]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return role;
}
export default GetCurrentUser;
