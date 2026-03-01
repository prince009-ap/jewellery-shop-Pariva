function Loader({ full }) {
  return (
    <div className={full ? "loader-full" : "loader-inline"}>
      <div className="spinner" />
    </div>
  );
}

export default Loader;
