import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Category() {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const getAllBrands = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/brand");
      setBrands(res.data.data);
    } catch (error) {
      throw error;
    }
  };
  const handleSearch = (brand) => {
    navigate("/product", {
      state: { brand: brand },
    });
  };

  useEffect(() => {
    if (location.state) {
      if (location.state.brand) {
        setSelectedBrand(location.state.brand);
      } else {
        setSelectedBrand("");
      }
    }
    getAllBrands();
  }, [location]);
  return (
    <div className="container category-brand">
      {brands ? (
        <>
          {brands.map((data) => {
            return (
              <div
                key={data.id}
                className={
                  selectedBrand === data.name
                    ? "category-item-selected text-label"
                    : "category-item text-label"
                }
                role="button"
                onClick={() => handleSearch(data.name)}
              >
                {data.name}
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
}

export default Category;
