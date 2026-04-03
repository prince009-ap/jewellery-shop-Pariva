import axios from "axios";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const HANDOVER_MESSAGE =
  "I understand your concern. Connecting you to our support agent now. If you need immediate assistance, you can also WhatsApp or call our customer care team at +91 97149 07350.";

const OFFLINE_SUPPORT_MESSAGE =
  "Our support agents are currently offline. Our team will get back to you as soon as possible. If you need immediate assistance, please WhatsApp or call our customer care team at +91 97149 07350.";

const COMPLEX_QUERY_PATTERNS = [
  /complaint/i,
  /payment/i,
  /refund/i,
  /angry/i,
  /frustrated/i,
  /upset/i,
  /human/i,
  /support agent/i,
  /representative/i,
  /custom order/i,
  /custom design/i,
  /call me/i,
  /issue/i,
  /problem/i,
  /not happy/i,
  /manager/i,
  /talk\s*(to|with)?\s*(a\s*)?(human|agent|person)/i,
  /connect\s*(me)?\s*(to|with)?\s*(a\s*)?(human|agent|person)/i,
  /live\s*(chat|agent|support)/i,
  /customer\s*(care|support)/i,
  /support/i,
  /agent/i,
];

const GREETING_PATTERNS = [
  /^hi+$/i,
  /^hello+$/i,
  /^hey+$/i,
  /^hii+$/i,
  /^yo+$/i,
  /^good morning$/i,
  /^good evening$/i,
  /^good afternoon$/i,
];

const PRODUCT_HINT_PATTERNS = [
  /ring/i,
  /necklace/i,
  /earring/i,
  /bangle/i,
  /bracelet/i,
  /pendant/i,
  /mangalsutra/i,
  /anklet/i,
  /gold/i,
  /silver/i,
  /diamond/i,
  /wedding/i,
  /gift/i,
  /daily wear/i,
  /office/i,
  /party/i,
  /price/i,
  /budget/i,
  /cost/i,
  /order/i,
  /delivery/i,
  /return/i,
  /exchange/i,
];

const STOP_WORDS = new Set([
  "hi",
  "hello",
  "hey",
  "pls",
  "please",
  "fast",
  "need",
  "want",
  "show",
  "me",
  "for",
  "the",
  "a",
  "an",
  "is",
  "are",
  "of",
  "to",
  "in",
  "on",
  "my",
  "your",
  "with",
  "under",
  "best",
]);

function normalizeModelJson(content) {
  if (!content) {
    return null;
  }

  if (typeof content === "object") {
    return content;
  }

  const cleaned = String(content).trim();

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
}

function buildProductSummary(products) {
  if (!products.length) {
    return "No exact product matches found.";
  }

  return products
    .map(
      (product) =>
        `${product.name} | ${product.category} | ${product.metal} ${product.purity} | Rs ${Number(
          product.price || 0
        ).toLocaleString("en-IN")} | stock ${product.stock ?? 0} | occasion ${
          product.occasion
        }`
    )
    .join("\n");
}

function buildOrderSummary(orders) {
  if (!orders.length) {
    return "No recent orders available for this user.";
  }

  return orders
    .map((order) => {
      const shortId = order._id.toString().slice(-8).toUpperCase();
      return `Order ${shortId} | status ${order.orderStatus} | payment ${
        order.payment?.status || "pending"
      } | total Rs ${Number(
        order.priceBreakup?.totalAmount || 0
      ).toLocaleString("en-IN")} | created ${new Date(order.createdAt).toLocaleDateString(
        "en-IN"
      )}`;
    })
    .join("\n");
}

function createRuleBasedReply({ message, products, orders }) {
  const text = message.toLowerCase();

  if (COMPLEX_QUERY_PATTERNS.some((pattern) => pattern.test(message))) {
    return { reply: HANDOVER_MESSAGE, handover: true };
  }

  if (GREETING_PATTERNS.some((pattern) => pattern.test(text.trim()))) {
    return {
      reply:
        "Welcome to Pariva Jewellery. I can help with rings, necklaces, earrings, orders, or returns. What would you like to explore?",
      handover: false,
    };
  }

  if (/order|delivery|return|exchange|refund/.test(text)) {
    if (orders.length) {
      const latest = orders[0];
      const shortId = latest._id.toString().slice(-8).toUpperCase();
      return {
        reply: `Your latest order ${shortId} is currently ${latest.orderStatus}. If you'd like help with returns or exchanges, I can connect you with our support team.`,
        handover: false,
      };
    }

    return {
      reply:
        "I can help with order status, returns, or exchanges. Please share your order ID, or I can connect you to our support agent.",
      handover: false,
    };
  }

  if (/wedding|gift|daily wear|office|party|occasion/.test(text) && products.length) {
    const names = products.slice(0, 3).map((product) => product.name).join(", ");
    return {
      reply: `For this occasion, I’d suggest ${names}. If you’d like, I can refine by budget, metal, or style.`,
      handover: false,
    };
  }

  if (/price|budget|cost|under/.test(text) && products.length) {
    const options = products
      .slice(0, 3)
      .map(
        (product) =>
          `${product.name} at Rs ${Number(product.price || 0).toLocaleString("en-IN")}`
      )
      .join(", ");

    return {
      reply: `Here are a few live-price references: ${options}. Share your budget and I’ll narrow it down.`,
      handover: false,
    };
  }

  if (products.length) {
    const top = products[0];
    return {
      reply: `${top.name} is available at Rs ${Number(top.price || 0).toLocaleString(
        "en-IN"
      )}. If you'd like, I can suggest similar pieces too.`,
      handover: false,
    };
  }

  return {
    reply:
      "I’d be happy to help with rings, necklaces, earrings, pricing, or order support. What would you like to explore?",
    handover: false,
  };
}

async function fetchRelevantProducts(message) {
  const rawText = String(message || "").trim();
  const lowered = rawText.toLowerCase();

  if (
    !rawText ||
    GREETING_PATTERNS.some((pattern) => pattern.test(lowered)) ||
    !PRODUCT_HINT_PATTERNS.some((pattern) => pattern.test(lowered))
  ) {
    return [];
  }

  const escapedText = rawText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tokens = lowered
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  const searchConditions = [
    { name: { $regex: escapedText, $options: "i" } },
    { category: { $regex: escapedText, $options: "i" } },
    { occasion: { $regex: escapedText, $options: "i" } },
    { metal: { $regex: escapedText, $options: "i" } },
    { purity: { $regex: escapedText, $options: "i" } },
  ];

  tokens.forEach((token) => {
    const tokenRegex = new RegExp(token, "i");
    searchConditions.push(
      { name: tokenRegex },
      { category: tokenRegex },
      { occasion: tokenRegex },
      { metal: tokenRegex },
      { purity: tokenRegex },
      { description: tokenRegex },
      { shortDescription: tokenRegex }
    );
  });

  return Product.find({
    $or: searchConditions,
  })
    .select("name category metal purity price stock occasion availability")
    .sort({ isFeatured: -1, isTrending: -1, createdAt: -1 })
    .limit(5);
}

async function callOpenAI({ message, products, orders }) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const payload = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "You are the Pariva Jewellery concierge.",
              "Reply in a premium, polite, concise tone.",
              "Use only the supplied product and order facts for pricing/order details.",
              "Never invent prices or order status.",
              `If the message involves complaint, payment issue, angry customer, custom order, or asks for a human, return reply "${HANDOVER_MESSAGE}" and handover true.`,
              "Ask one short follow-up question only when needed.",
              "Return strict JSON only.",
            ].join(" "),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Customer message: ${message}\n\nAvailable products:\n${buildProductSummary(
              products
            )}\n\nRecent orders:\n${buildOrderSummary(orders)}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "pariva_chat_response",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            reply: { type: "string" },
            handover: { type: "boolean" },
          },
          required: ["reply", "handover"],
        },
      },
    },
  };

  const response = await axios.post("https://api.openai.com/v1/responses", payload, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    timeout: 20000,
  });

  if (response.data?.output_parsed) {
    return response.data.output_parsed;
  }

  const outputText =
    response.data?.output_text ||
    response.data?.output?.[0]?.content?.[0]?.text ||
    response.data?.content?.[0]?.text;

  return normalizeModelJson(outputText);
}

export async function generateAIChatResponse({ message, user }) {
  const trimmedMessage = String(message || "").trim();

  if (!trimmedMessage) {
    return {
      reply: "Please share a little more so I can help.",
      handover: false,
    };
  }

  const products = await fetchRelevantProducts(trimmedMessage);
  const orders = user?._id
    ? await Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
    : [];

  try {
    const aiResult = await callOpenAI({
      message: trimmedMessage,
      products,
      orders,
    });

    if (aiResult?.reply && typeof aiResult.handover === "boolean") {
      return {
        reply: aiResult.reply,
        handover: aiResult.handover,
      };
    }
  } catch (error) {
    console.error("AI chat error:", error.response?.data || error.message);
  }

  return createRuleBasedReply({
    message: trimmedMessage,
    products,
    orders,
  });
}

export { HANDOVER_MESSAGE, OFFLINE_SUPPORT_MESSAGE };
