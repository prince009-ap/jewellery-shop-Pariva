import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

function AdminRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    await API.post("/admin/register", form);
    navigate("/admin/login");
  };

  return (
    <form onSubmit={submitHandler}>
      <h2>Admin Register</h2>

      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />

      <button>Register</button>
    </form>
  );
}

export default AdminRegister;
