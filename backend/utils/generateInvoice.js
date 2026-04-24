import PDFDocument from "pdfkit";
import User from "../models/User.js";

const formatCurrency = (value) =>
  `Rs.${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const buildInvoiceNumber = (order) =>
  `INV-${String(order?._id || "").slice(-6).toUpperCase()}`;

const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
};

const collectAddressLines = (shippingAddress) => {
  const address = shippingAddress || {};
  const street =
    address.address ||
    address.addressLine ||
    [
      address.house,
      address.floor,
      address.area,
      address.landmark,
    ]
      .filter(Boolean)
      .join(", ");

  return [
    safeText(address.name, "Customer"),
    safeText(street, ""),
    [address.city, address.state, address.pincode].filter(Boolean).join(", "),
    safeText(address.country, "India"),
    address.phone ? `Phone: ${address.phone}` : "",
    address.email ? `Email: ${address.email}` : "",
  ].filter(Boolean);
};

const resolveCustomerDetails = async (order) => {
  const shippingAddress = order.shippingAddress || {};
  let user = null;

  if (order.user && typeof order.user === "object" && "email" in order.user) {
    user = order.user;
  } else if (order.user) {
    user = await User.findById(order.user).select("name email mobile");
  }

  return {
    name: shippingAddress.name || user?.name || "Customer",
    email: shippingAddress.email || user?.email || "-",
    phone: shippingAddress.phone || user?.mobile || "-",
  };
};

const drawLabelValue = (doc, label, value) => {
  doc.font("Helvetica-Bold").text(label, { continued: true });
  doc.font("Helvetica").text(value);
};

const drawSectionTitle = (doc, title) => {
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#b8860b").text(title);
  doc.moveDown(0.3);
  doc.strokeColor("#d4af37").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.6);
  doc.fillColor("#111111").fontSize(11);
};

const ensureSpace = (doc, needed = 80) => {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
};

const generateInvoice = async (order) => {
  if (!order) {
    throw new Error("Order data is required to generate invoice.");
  }

  const customer = await resolveCustomerDetails(order);
  const shippingAddress = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const totals = order.priceBreakup || {};
  const paymentMethod =
    order.payment?.method === "razorpay" ? "Online Payment" : "Cash on Delivery";
  const paymentStatus =
    order.payment?.status === "paid" || order.payment?.method === "razorpay"
      ? "Paid"
      : "Pending";
  const invoiceNumber = buildInvoiceNumber(order);

  return await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Invoice ${invoiceNumber}`,
          Author: "PARIVA Jewellery",
        },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.rect(0, 0, doc.page.width, 105).fill("#111111");
      doc
        .fillColor("#d4af37")
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("PARIVA JEWELLERY", 40, 30);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#ffffff")
        .text("Order Invoice", 40, 62);
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#ffffff")
        .text(`Generated: ${formatDate(new Date())}`, 400, 36, { align: "right" });

      doc.y = 125;
      drawSectionTitle(doc, "Invoice Details");
      drawLabelValue(doc, "Invoice Number: ", invoiceNumber);
      drawLabelValue(doc, "Order ID: ", safeText(order._id));
      drawLabelValue(doc, "Order Date: ", formatDate(order.createdAt));
      drawLabelValue(doc, "Order Status: ", safeText(order.orderStatus, "pending").toUpperCase());
      drawLabelValue(doc, "Payment Method: ", paymentMethod);
      drawLabelValue(doc, "Payment Status: ", paymentStatus);

      drawSectionTitle(doc, "Customer Details");
      drawLabelValue(doc, "Name: ", safeText(customer.name));
      drawLabelValue(doc, "Email: ", safeText(customer.email));
      drawLabelValue(doc, "Phone: ", safeText(customer.phone));

      drawSectionTitle(doc, "Shipping Address");
      collectAddressLines(shippingAddress).forEach((line) => {
        doc.font("Helvetica").text(line);
      });

      drawSectionTitle(doc, "Order Items");
      const tableTop = doc.y;
      const columns = [40, 250, 320, 395, 475];
      doc
        .rect(40, tableTop, 515, 22)
        .fill("#f4e7b0");
      doc
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Product", columns[0] + 6, tableTop + 7)
        .text("Qty", columns[1] + 6, tableTop + 7)
        .text("Rate", columns[2] + 6, tableTop + 7)
        .text("Metal", columns[3] + 6, tableTop + 7)
        .text("Total", columns[4] + 6, tableTop + 7);

      let rowY = tableTop + 22;
      items.forEach((item, index) => {
        ensureSpace(doc, 32);
        const rowHeight = 24;
        if (index % 2 === 0) {
          doc.rect(40, rowY, 515, rowHeight).fill("#faf7ef");
        }
        doc
          .fillColor("#111111")
          .font("Helvetica")
          .fontSize(10)
          .text(safeText(item?.name, "Jewellery Item"), columns[0] + 6, rowY + 7, {
            width: columns[1] - columns[0] - 12,
          })
          .text(String(item?.qty || 0), columns[1] + 6, rowY + 7)
          .text(formatCurrency(item?.price || 0), columns[2] + 6, rowY + 7)
          .text(safeText(item?.metal, "-"), columns[3] + 6, rowY + 7)
          .text(formatCurrency((item?.price || 0) * (item?.qty || 0)), columns[4] + 6, rowY + 7);
        rowY += rowHeight;
        doc.y = rowY;
      });

      ensureSpace(doc, 130);
      doc.moveDown(0.8);
      drawSectionTitle(doc, "Price Summary");
      const summaryRows = [
        ["Gold Value", totals.goldValue],
        ["Making Charge", totals.makingCharge],
        ["Stone Charge", totals.stoneCharge],
        ["GST", totals.gst],
        ["Total Amount", totals.totalAmount],
      ];

      summaryRows.forEach(([label, amount], index) => {
        const isTotal = index === summaryRows.length - 1;
        doc
          .font(isTotal ? "Helvetica-Bold" : "Helvetica")
          .fontSize(isTotal ? 12 : 11)
          .text(label, 300, doc.y, { continued: true })
          .text(formatCurrency(amount), { align: "right" });
        doc.moveDown(0.3);
      });

      ensureSpace(doc, 90);
      drawSectionTitle(doc, "Support");
      doc
        .font("Helvetica")
        .fontSize(10)
        .text("For invoice or order help, contact PARIVA Jewellery.")
        .text("Email: senjaliyaprince009@gmail.com")
        .text("Phone: +91 97149 07350");

      doc
        .font("Helvetica-Oblique")
        .fontSize(9)
        .fillColor("#666666")
        .text("This is a system-generated invoice and does not require a signature.", 40, 780, {
          align: "center",
          width: 515,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export { generateInvoice };
