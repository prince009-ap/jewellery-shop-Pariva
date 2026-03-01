import { useState } from "react";
import adminAPI from "../../services/adminApi";
import { useNavigate } from "react-router-dom";

export default function AddBanner() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [desktop, setDesktop] = useState(null);


  const submit = async () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("link", link);
    fd.append("desktop", desktop);
    

    await adminAPI.post("/admin/banners", fd);

    navigate("/admin/banners");

  };

  return (
    <div className="admin-card">
      <h2>Add Banner</h2>

      <input
        placeholder="Banner title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        placeholder="Redirect link"
        value={link}
        onChange={e => setLink(e.target.value)}
      />

      <label>Desktop Banner</label>
      <input type="file" onChange={e => setDesktop(e.target.files[0])} />


      <button onClick={submit}>Save Banner</button>
    </div>
  );
}
