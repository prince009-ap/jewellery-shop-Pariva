import { useEffect, useState } from "react";
import adminAPI from "../../services/adminApi";
import DesignModal from "./DesignModal";


export default function AdminCustomDesigns() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const res = await adminAPI.get("/admin/custom-design");
    setList(res.data);
  };

  useEffect(() => {
  const load = async () => {
    try {
      const res = await adminAPI.get("/admin/custom-design");
      setList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  load();
}, []);


  return (
    <div style={{ padding: 30 }}>
      <h2>Custom Design Requests</h2>

      <table width="100%" border="1" cellPadding="10">
        <thead>
          <tr>
            <th>User</th>
            <th>Jewellery</th>
            <th>Metal</th>
            <th>Status</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {list.map(d => (
            <tr key={d._id}>
  <td>{d.userId?.email}</td>
  <td>{d.jewelleryType}</td>
  <td>{d.metalType}</td>
  <td>{d.status}</td>
  <td>
    <button onClick={() => setSelected(d)}>Open</button>
  </td>
</tr>

          ))}
        </tbody>
      </table>

      {selected && (
        <DesignModal
          design={selected}
          onClose={() => setSelected(null)}
          onUpdate={load}
        />
      )}
    </div>
  );
}
