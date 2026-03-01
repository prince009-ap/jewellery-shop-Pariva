import { useEffect, useState } from "react";

import adminAPI from "../../services/adminApi";

import { Link } from "react-router-dom";



export default function BannerManager() {

  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);



  const loadBanners = async () => {

    try {

      const res = await adminAPI.get("admin/banners");

      setBanners(res.data);

    } catch (err) {

      console.error("Load banners error", err);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    loadBanners();

  }, []);





const deleteBanner = async (id) => {

  if (!window.confirm("Delete this banner?")) return;

  await adminAPI.delete(`/admin/banners/${id}`);

  loadBanners();

};



const toggleStatus = async (id) => {

  await adminAPI.put(`/admin/banners/${id}/toggle`);

  loadBanners();

};





  if (loading) return <p style={{ padding: 30 }}>Loading banners...</p>;



  return (

    <div style={{ padding: "2rem" }}>

      <h2>Banner Manager</h2>



      {/* 🔥 ACTION BAR */}

      <div style={{ marginBottom: "1.5rem" }}>

        <Link to="/admin/banners/add">

          <button>Add New Banner</button>

        </Link>

      </div>



      {/* 🔥 LIST TABLE */}

      {banners.length === 0 ? (

        <p>No banners added yet</p>

      ) : (

        <table width="100%" border="1" cellPadding="10">

          <thead>

            <tr>

              <th>Desktop</th>

              

              <th>Title</th>

              <th>Status</th>

              <th>Actions</th>

            </tr>

          </thead>



          <tbody>

            {banners.map((b) => (

              <tr key={b._id}>

                <td>

                  <img

                    src={`http://localhost:5000/uploads/${b.imageDesktop}`}

                    width="120"

                    alt="desktop"

                  />

                </td>



            



                <td>{b.title || "-"}</td>



                <td>

                  <button onClick={() => toggleStatus(b._id)}>

                    {b.isActive ? "🟢 Active" : "🔴 Disabled"}



                  </button>

                </td>



                <td>

                  <button onClick={() => deleteBanner(b._id)}>

                    Delete

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}

