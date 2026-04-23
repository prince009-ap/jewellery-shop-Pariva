import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MdAttachFile,
  MdChat,
  MdClose,
  MdDone,
  MdDoneAll,
  MdImage,
  MdInsertDriveFile,
  MdSupportAgent,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import {
  createChatSocket,
  getMyConversation,
  uploadChatAttachment,
} from "../../services/chatService";
import "./ChatWidget.css";

const TYPING_TIMEOUT_MS = 1200;

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TALK_TO_AGENT_MESSAGE = "I want to talk to a human agent";

function TickStatus({ status }) {
  if (status === "seen") {
    return <MdDoneAll className="chat-tick seen" />;
  }

  if (status === "delivered") {
    return <MdDoneAll className="chat-tick delivered" />;
  }

  return <MdDone className="chat-tick sent" />;
}

const MESSAGE_STATUS_RANK = {
  sent: 1,
  delivered: 2,
  seen: 3,
};

function getMergedStatus(previousStatus, nextStatus) {
  const previousRank = MESSAGE_STATUS_RANK[previousStatus] || 0;
  const nextRank = MESSAGE_STATUS_RANK[nextStatus] || 0;
  return nextRank >= previousRank ? nextStatus : previousStatus;
}

function mergeMessages(current, incoming) {
  const map = new Map(current.map((message) => [message.id, message]));

  incoming.forEach((message) => {
    const previous = map.get(message.id);
    map.set(
      message.id,
      previous
        ? {
            ...previous,
            ...message,
            status: getMergedStatus(previous.status, message.status),
          }
        : message
    );
  });

  return Array.from(map.values()).sort(
    (left, right) => new Date(left.timestamp) - new Date(right.timestamp)
  );
}

export default function ChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [typingState, setTypingState] = useState({ isTyping: false, sender: null });
  const [agentOnline, setAgentOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollerRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const shouldRaiseForCheckout = location.pathname.startsWith("/checkout");
  const shouldDeferLauncher =
    location.pathname.startsWith("/custom-design") ||
    location.pathname.startsWith("/my-custom-designs") ||
    location.pathname.startsWith("/account/profile");

  const title = useMemo(() => {
    if (conversation?.mode === "agent") return "Live Support";
    if (conversation?.mode === "waiting_agent") return "Connecting to Support";
    return "Pariva Assistant";
  }, [conversation?.mode]);

  const emitSeen = () => {
    if (!open || !conversation?._id || !socketRef.current) return;
    if (document.visibilityState !== "visible") return;
    socketRef.current.emit("chat:seen", { conversationId: conversation._id });
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return undefined;
    }

    let mounted = true;

    const initialize = async () => {
      setLoading(true);

      try {
        const data = await getMyConversation();
        if (!mounted) return;

        setConversation(data.conversation);
        setMessages(data.messages || []);

        const socket = createChatSocket("user");
        socketRef.current = socket;

        socket?.on("connect", () => {
          socket.emit("chat:join", { conversationId: data.conversation._id });
        });

        socket?.on("chat:messages", (payload) => {
          if (payload.conversationId !== data.conversation._id) return;

          setMessages((current) => mergeMessages(current, payload.messages || []));

          setConversation((current) =>
            current
              ? {
                  ...current,
                  mode: payload.mode || current.mode,
                  assignedAgent: payload.assignedAgent || current.assignedAgent,
                }
              : current
          );

          const hasIncoming = (payload.messages || []).some(
            (message) => message.sender === "agent" || message.sender === "bot"
          );

          if (hasIncoming && document.visibilityState === "visible") {
            socket.emit("chat:seen", { conversationId: data.conversation._id });
          }
        });

        socket?.on("chat:typing", (payload) => {
          if (payload.conversationId !== data.conversation._id) return;
          setTypingState({
            isTyping: payload.isTyping,
            sender: payload.sender,
          });
        });

        socket?.on("chat:presence", (payload) => {
          setAgentOnline(Boolean(payload.agentOnline));
        });

        socket?.on("chat:status_sync", () => {
          void refreshConversation();
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const refreshConversation = async () => {
      const data = await getMyConversation();
      if (!mounted) return;
      setConversation(data.conversation);
      setMessages((current) => mergeMessages(current, data.messages || []));
    };

    void initialize();

    return () => {
      mounted = false;
      clearTimeout(typingTimeoutRef.current);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typingState]);

  useEffect(() => {
    if (!open || !conversation?._id || !socketRef.current) {
      return undefined;
    }

    emitSeen();
    window.addEventListener("focus", emitSeen);
    document.addEventListener("visibilitychange", emitSeen);

    return () => {
      window.removeEventListener("focus", emitSeen);
      document.removeEventListener("visibilitychange", emitSeen);
    };
  }, [open, conversation?._id]);

  useEffect(() => {
    if (!open || !conversation?._id) return;

    const hasUnreadIncoming = messages.some(
      (message) =>
        (message.sender === "agent" || message.sender === "bot") && message.status !== "seen"
    );

    if (hasUnreadIncoming) {
      emitSeen();
    }
  }, [messages, open, conversation?._id]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const sendMessage = () => {
    const text = draft.trim();
    if ((!text && !pendingAttachments.length) || !conversation?._id || !socketRef.current) return;

    socketRef.current.emit("chat:send", {
      conversationId: conversation._id,
      text,
      attachments: pendingAttachments,
    });

    socketRef.current.emit("chat:typing", {
      conversationId: conversation._id,
      isTyping: false,
    });

    setDraft("");
    setPendingAttachments([]);
    clearTimeout(typingTimeoutRef.current);
  };

  const requestHumanAgent = () => {
    if (!conversation?._id || !socketRef.current) return;

    socketRef.current.emit("chat:send", {
      conversationId: conversation._id,
      text: TALK_TO_AGENT_MESSAGE,
      attachments: [],
    });

    socketRef.current.emit("chat:typing", {
      conversationId: conversation._id,
      isTyping: false,
    });
  };

  const handleAttachmentSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAttachment(true);
      const attachment = await uploadChatAttachment(file);
      setPendingAttachments((current) => [...current, attachment]);
    } catch (error) {
      console.error("Chat upload failed:", error);
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePendingAttachment = (filename) => {
    setPendingAttachments((current) =>
      current.filter((attachment) => attachment.filename !== filename)
    );
  };

  const renderAttachments = (attachments) =>
    attachments?.map((attachment) => (
      <div key={attachment.filename} className="chat-attachment">
        {attachment.kind === "image" ? (
          <a href={attachment.url} target="_blank" rel="noreferrer">
            <img src={attachment.url} alt={attachment.originalName} />
          </a>
        ) : (
          <a href={attachment.url} target="_blank" rel="noreferrer" className="chat-file-link">
            <MdInsertDriveFile size={18} />
            <span>{attachment.originalName}</span>
          </a>
        )}
      </div>
    ));

  const handleDraftChange = (value) => {
    setDraft(value);

    if (!conversation?._id || !socketRef.current) {
      return;
    }

    socketRef.current.emit("chat:typing", {
      conversationId: conversation._id,
      isTyping: value.trim().length > 0,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("chat:typing", {
        conversationId: conversation._id,
        isTyping: false,
      });
    }, TYPING_TIMEOUT_MS);
  };

  return (
    <div
      className={`chat-widget-shell ${open ? "open" : ""} ${
        shouldRaiseForCheckout ? "chat-widget-shell--raised" : ""
      } ${shouldDeferLauncher ? "chat-widget-shell--defer" : ""} ${
        shouldDeferLauncher && open ? "chat-widget-shell--defer-open" : ""
      }`}
    >
      {open ? (
        <section className="chat-widget-panel">
          <header className="chat-widget-header">
            <div>
              <p className="chat-widget-kicker">Pariva Jewellery</p>
              <h3>{title}</h3>
              <p className="chat-widget-presence">
                {conversation?.mode === "waiting_agent"
                  ? "A support specialist will join shortly"
                  : agentOnline
                    ? "Agent online"
                    : "Bot available now"}
              </p>
            </div>

            <button
              type="button"
              className="chat-icon-button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <MdClose size={20} />
            </button>
          </header>

          <div className="chat-widget-body" ref={scrollerRef}>
            {loading ? <p className="chat-empty">Loading your conversation...</p> : null}

            {messages.map((message) => {
              const mine = message.sender === "user";

              return (
                <article
                  key={message.id}
                  className={`chat-bubble-row ${mine ? "mine" : "theirs"}`}
                >
                  <div className={`chat-bubble ${mine ? "mine" : message.sender}`}>
                    {message.text ? <p>{message.text}</p> : null}
                    {renderAttachments(message.attachments)}
                    <div className="chat-bubble-meta">
                      <span>{formatTime(message.timestamp)}</span>
                      {mine ? <TickStatus status={message.status} /> : null}
                    </div>
                  </div>
                </article>
              );
            })}

            {typingState.isTyping && typingState.sender !== "user" ? (
              <p className="chat-typing-line">
                {typingState.sender === "agent" ? "Agent is typing..." : "Assistant is typing..."}
              </p>
            ) : null}
          </div>

          <footer className="chat-widget-footer">
            <div className="chat-widget-mode">
              <MdSupportAgent size={16} />
              <span>
                {conversation?.mode === "agent"
                  ? "You’re now chatting with a human agent"
                  : conversation?.mode === "waiting_agent"
                    ? "Support handover in progress"
                    : "AI assistant active"}
              </span>
            </div>

            {conversation?.mode !== "agent" && conversation?.mode !== "waiting_agent" ? (
              <button
                type="button"
                className="chat-handover-button"
                onClick={requestHumanAgent}
              >
                Talk to Agent
              </button>
            ) : null}

            {pendingAttachments.length ? (
              <div className="chat-pending-list">
                {pendingAttachments.map((attachment) => (
                  <button
                    key={attachment.filename}
                    type="button"
                    className="chat-pending-chip"
                    onClick={() => removePendingAttachment(attachment.filename)}
                  >
                    {attachment.kind === "image" ? <MdImage size={16} /> : <MdAttachFile size={16} />}
                    <span>{attachment.originalName}</span>
                    <strong>x</strong>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="chat-input-row">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleAttachmentSelect}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="chat-attach-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAttachment}
                title="Attach image or file"
              >
                <MdAttachFile size={18} />
              </button>
              <input
                type="text"
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                onFocus={emitSeen}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about products, orders, or support"
              />
              <button type="button" onClick={sendMessage}>
                {uploadingAttachment ? "Uploading..." : "Send"}
              </button>
            </div>
          </footer>
        </section>
      ) : null}

      <button
        type="button"
        className="chat-launcher"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open Pariva chat"
      >
        <MdChat size={22} />
        <span>Chat</span>
      </button>
    </div>
  );
}
