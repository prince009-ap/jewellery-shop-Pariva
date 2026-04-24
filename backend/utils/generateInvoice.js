import PDFDocument from "pdfkit";
import User from "../models/User.js";

const GOLD = "#d4af37";
const GOLD_DARK = "#b9911b";
const GOLD_LIGHT = "#fbf6df";
const BORDER = "#d8d8d8";
const TEXT = "#333333";
const MUTED = "#666666";
const GREEN = "#39a85a";
const GREEN_LIGHT = "#eaf7ee";

const formatCurrency = (value) =>
  `Rs.${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const buildInvoiceNumber = (order) =>
  `INV-${String(order?._id || "").slice(-6).toUpperCase()}`;

const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
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

const getAddressText = (shippingAddress) => {
  const address = shippingAddress || {};
  return (
    address.address ||
    address.addressLine ||
    [address.house, address.floor, address.area, address.landmark]
      .filter(Boolean)
      .join(", ") ||
    "-"
  );
};

const getPaymentMethodLabel = (order) =>
  order.payment?.method === "razorpay" ? "Online Payment" : "Cash on Delivery";

const getPaymentStatusLabel = (order) =>
  order.payment?.status === "paid" || order.payment?.method === "razorpay"
    ? "PAID"
    : "PENDING";

const getOrderStatusLabel = (order) => safeText(order.orderStatus, "pending").toUpperCase();

const estimateDelivery = (order) =>
  Math.max(3, Math.min(7, (order.items?.length || 1) + 4));

const drawPageFrame = (doc) => {
  doc
    .lineWidth(1)
    .strokeColor("#2c2c2c")
    .rect(44, 28, doc.page.width - 88, doc.page.height - 56)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(6)
    .fillColor(MUTED)
    .text("PARIVA Jewellery - Order Invoice", 0, 36, {
      align: "center",
      width: doc.page.width,
    });

  doc
    .font("Helvetica")
    .fontSize(6)
    .fillColor(MUTED)
    .text("PARIVA Jewellery - Order Invoice", 0, doc.page.height - 26, {
      align: "center",
      width: doc.page.width,
    });
};

const drawInnerCard = (doc, x, y, width, height) => {
  doc.roundedRect(x, y, width, height, 6).lineWidth(1).strokeColor("#8a8a8a").stroke();
};

const drawCenteredHeader = (doc, x, y, width) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(GOLD)
    .text("PARIVA JEWELLERY", x, y, { width, align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(TEXT)
    .text("Order Invoice", x, y + 30, { width, align: "center" });

  doc
    .lineWidth(2)
    .strokeColor(GOLD)
    .moveTo(x + 14, y + 66)
    .lineTo(x + width - 14, y + 66)
    .stroke();
};

const drawInfoBlock = (doc, x, y, width, title, rows) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(GOLD_DARK)
    .text(title, x, y, { width });

  let cursorY = y + 16;
  rows.forEach(([label, value]) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(MUTED)
      .text(`${label}:`, x, cursorY, { continued: true });
    doc.font("Helvetica").fillColor(TEXT).text(` ${safeText(value)}`, {
      width,
    });
    cursorY += 12;
  });

  return cursorY;
};

const drawStatusPill = (doc, x, y, label, bgColor, textColor = "#ffffff") => {
  const pillWidth = Math.max(44, label.length * 5.2 + 16);
  doc.roundedRect(x, y, pillWidth, 14, 7).fillColor(bgColor).fill();
  doc
    .font("Helvetica-Bold")
    .fontSize(6.5)
    .fillColor(textColor)
    .text(label, x, y + 4, { width: pillWidth, align: "center" });
  return pillWidth;
};

const drawSectionLabel = (doc, x, y, width, title) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(GOLD_DARK)
    .text(title, x, y);
  doc
    .lineWidth(1.5)
    .strokeColor(GOLD)
    .moveTo(x, y + 14)
    .lineTo(x + width, y + 14)
    .stroke();
};

const drawItemsTable = (doc, x, y, width, items) => {
  const colWidths = [190, 55, 75, 55, 85];
  const headers = ["Product Name", "Quantity", "Unit Price", "Metal", "Total"];
  const headerHeight = 18;
  const rowHeight = 20;

  doc.rect(x, y, width, headerHeight).fillColor(GOLD).fill();
  let cursorX = x;
  headers.forEach((header, index) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(6.8)
      .fillColor("#ffffff")
      .text(header, cursorX + 6, y + 6, {
        width: colWidths[index] - 12,
        align: index === 0 ? "left" : "center",
      });
    cursorX += colWidths[index];
  });

  let currentY = y + headerHeight;
  items.forEach((item, index) => {
    const bg = index % 2 === 0 ? "#ffffff" : "#fcfcfc";
    doc.rect(x, currentY, width, rowHeight).fillColor(bg).fill();
    doc.rect(x, currentY, width, rowHeight).lineWidth(0.5).strokeColor("#e8e8e8").stroke();

    let itemX = x;
    [
      safeText(item?.name, "Jewellery Item"),
      String(item?.qty || 0),
      formatCurrency(item?.price || 0),
      safeText(item?.metal, "Gold"),
      formatCurrency((item?.price || 0) * (item?.qty || 0)),
    ].forEach((value, cellIndex) => {
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(TEXT)
        .text(value, itemX + 6, currentY + 6, {
          width: colWidths[cellIndex] - 12,
          align: cellIndex === 0 ? "left" : "center",
        });
      itemX += colWidths[cellIndex];
    });

    currentY += rowHeight;
  });

  return currentY;
};

const drawTotals = (doc, x, y, width, totals) => {
  const rows = [
    ["Gold Value:", totals.goldValue],
    ["Making Charges:", totals.makingCharge],
    ["Stone Charges:", totals.stoneCharge],
    ["GST:", totals.gst],
  ];

  let cursorY = y;
  rows.forEach(([label, amount]) => {
    doc.font("Helvetica").fontSize(8).fillColor(TEXT).text(label, x, cursorY);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(TEXT)
      .text(formatCurrency(amount), x, cursorY, { width, align: "right" });
    cursorY += 17;
  });

  doc
    .lineWidth(1.5)
    .strokeColor(GOLD)
    .moveTo(x, cursorY + 4)
    .lineTo(x + width, cursorY + 4)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(GOLD_DARK)
    .text("Total Amount:", x, cursorY + 12);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(GOLD_DARK)
    .text(formatCurrency(totals.totalAmount), x, cursorY + 12, {
      width,
      align: "right",
    });

  return cursorY + 30;
};

const drawInfoPanel = (doc, x, y, width, title, rows, tone = "gold") => {
  const bgColor = tone === "green" ? GREEN_LIGHT : GOLD_LIGHT;
  const titleColor = tone === "green" ? "#2d8f49" : GOLD_DARK;
  const borderColor = tone === "green" ? "#c7e9d0" : "#f1e0a5";
  const height = 72;

  doc.roundedRect(x, y, width, height, 4).fillColor(bgColor).fill();
  doc.roundedRect(x, y, width, height, 4).lineWidth(0.8).strokeColor(borderColor).stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(titleColor)
    .text(title, x + 10, y + 8);

  let cursorY = y + 24;
  rows.forEach((row) => {
    if (row.type === "status") {
      doc.font("Helvetica-Bold").fontSize(6.8).fillColor(TEXT).text(`${row.label}:`, x + 10, cursorY);
      drawStatusPill(doc, x + 80, cursorY - 2, row.value, row.bgColor, row.textColor);
      cursorY += 15;
      return;
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(6.8)
      .fillColor(TEXT)
      .text(`${row.label}:`, x + 10, cursorY, { continued: true });
    doc.font("Helvetica").fillColor(TEXT).text(` ${safeText(row.value)}`, {
      width: width - 20,
    });
    cursorY += 12;
  });
};

const generateInvoice = async (order) => {
  if (!order) {
    throw new Error("Order data is required to generate invoice.");
  }

  const customer = await resolveCustomerDetails(order);
  const shippingAddress = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const totals = order.priceBreakup || {};
  const invoiceNumber = buildInvoiceNumber(order);
  const paymentMethod = getPaymentMethodLabel(order);
  const paymentStatus = getPaymentStatusLabel(order);
  const orderStatus = getOrderStatusLabel(order);
  const trackingId = safeText(order._id);
  const addressText = getAddressText(shippingAddress);
  const estimatedDeliveryDays = estimateDelivery(order);

  return await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: {
          Title: `Invoice ${invoiceNumber}`,
          Author: "PARIVA Jewellery",
        },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      drawPageFrame(doc);

      const cardX = 84;
      const cardY = 70;
      const cardWidth = 430;
      const cardHeight = 705;

      drawInnerCard(doc, cardX, cardY, cardWidth, cardHeight);
      drawCenteredHeader(doc, cardX + 20, cardY + 18, cardWidth - 40);

      const infoY = cardY + 92;
      const infoX = cardX + 16;
      const infoWidth = cardWidth - 32;
      const colWidth = 120;

      doc
        .roundedRect(infoX, infoY, infoWidth, 96, 3)
        .fillColor("#fbfbfb")
        .fill();
      doc.roundedRect(infoX, infoY, infoWidth, 96, 3).lineWidth(0.7).strokeColor("#ececec").stroke();

      drawInfoBlock(doc, infoX + 10, infoY + 9, colWidth, "Invoice Details", [
        ["Invoice #", invoiceNumber],
        ["Order ID", safeText(order._id)],
        ["Date", formatDate(order.createdAt)],
      ]);
      drawStatusPill(doc, infoX + 10, infoY + 64, orderStatus, GREEN);

      drawInfoBlock(doc, infoX + 144, infoY + 9, colWidth, "Customer Information", [
        ["Name", customer.name],
        ["Email", customer.email],
        ["Phone", customer.phone],
      ]);

      drawInfoBlock(doc, infoX + 278, infoY + 9, colWidth, "Delivery Address", [
        ["Type", shippingAddress.name || customer.name],
        ["Address", addressText],
        ["Phone", shippingAddress.phone || customer.phone],
      ]);

      const itemsSectionY = infoY + 118;
      drawSectionLabel(doc, infoX, itemsSectionY, infoWidth, "Order Items");
      const tableEndY = drawItemsTable(doc, infoX, itemsSectionY + 24, infoWidth, items);

      const totalsEndY = drawTotals(doc, infoX + 8, tableEndY + 18, infoWidth - 16, totals);

      const orderInfoY = totalsEndY + 18;
      drawInfoPanel(
        doc,
        infoX,
        orderInfoY,
        infoWidth,
        "Order Information",
        [
          { label: "Estimated Delivery", value: `${estimatedDeliveryDays}-${estimatedDeliveryDays + 2} business days` },
          { label: "Payment Method", value: paymentMethod },
          { type: "status", label: "Payment Status", value: paymentStatus, bgColor: GOLD, textColor: "#ffffff" },
          { type: "status", label: "Order Status", value: orderStatus, bgColor: GREEN, textColor: "#ffffff" },
        ],
        "gold"
      );

      const trackingY = orderInfoY + 92;
      drawInfoPanel(
        doc,
        infoX,
        trackingY,
        infoWidth,
        "Order Tracking",
        [
          { label: "Tracking ID", value: trackingId },
          { label: "Info", value: "Use this tracking ID on our website or mobile app." },
          { label: "Customer Support", value: "senjaliyaprince009@gmail.com | +91 97149 07350" },
        ],
        "green"
      );

      doc
        .font("Helvetica")
        .fontSize(6)
        .fillColor(MUTED)
        .text("© 2024 PARIVA Jewellery. All rights reserved.", cardX + 40, cardY + 664, {
          width: cardWidth - 80,
          align: "center",
        });
      doc
        .text("Thank you for choosing PARIVA Jewellery for your fine jewellery needs!", cardX + 40, cardY + 674, {
          width: cardWidth - 80,
          align: "center",
        })
        .text("This is an automated invoice. Please keep it for your records.", cardX + 40, cardY + 684, {
          width: cardWidth - 80,
          align: "center",
        })
        .text(`Generated on: ${new Date().toLocaleString("en-IN")}`, cardX + 40, cardY + 694, {
          width: cardWidth - 80,
          align: "center",
        });

      doc
        .font("Helvetica")
        .fontSize(5.5)
        .fillColor(MUTED)
        .text("Page 1 of 1", 0, doc.page.height - 38, {
          align: "center",
          width: doc.page.width,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export { generateInvoice };
