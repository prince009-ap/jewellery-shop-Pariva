const steps = ["pending", "confirmed", "shipped", "delivered"];

function OrderTimeline({ status }) {
  const currentIndex = steps.indexOf(status);

  return (
    <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
      {steps.map((step, i) => (
        <div key={step} style={{ textAlign: "center" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: i <= currentIndex ? "green" : "#ccc",
              color: "#fff",
              lineHeight: "30px",
            }}
          >
            {i + 1}
          </div>
          <small>{step.charAt(0).toUpperCase() + step.slice(1)}</small>
        </div>
      ))}
    </div>
  );
}

export default OrderTimeline;
