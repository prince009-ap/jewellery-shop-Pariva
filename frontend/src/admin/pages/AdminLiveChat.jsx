import { useEffect, useMemo, useRef, useState } from "react";
import {
  MdAttachFile,
  MdDone,
  MdDoneAll,
  MdImage,
  MdInsertDriveFile,
} from "react-icons/md";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  claimAdminConversation,
  createChatSocket,
  getAdminConversation,
  getAdminConversations,
  uploadChatAttachment,
} from "../../services/chatService";
import "./AdminLiveChat.css";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLastSeen(timestamp) {
  if (!timestamp) return "Not seen yet";
  return new Date(timestamp).toLocaleString();
}

function MessageTick({ status }) {
  if (status === "seen") return <MdDoneAll className="admin-chat-tick seen" />;
  if (status === "delivered") return <MdDoneAll className="admin-chat-tick delivered" />;
  return <MdDone className="admin-chat-tick sent" />;
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

export default function AdminLiveChat() {
  const { admin } = useAdminAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [typing, setTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const socketRef = useRef(null);
  const scrollerRef = useRef(null);
  const activeIdRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeId = activeConversation?._id;
  const currentAdminId = admin?._id || admin?.id || null;
  const assignedAgentId = activeConversation?.assignedAgent?._id || activeConversation?.assignedAgent;
  const isAssignedToCurrentAdmin =
    Boolean(assignedAgentId) && Boolean(currentAdminId) && String(assignedAgentId) === String(currentAdminId);
  const canTakeOver =
    Boolean(activeConversation) &&
    (!activeConversation?.assignedAgent ||
      activeConversation?.handoverRequested ||
      activeConversation?.mode === "waiting_agent" ||
      isAssignedToCurrentAdmin);

  const canReply = useMemo(() => {
    if (!activeConversation) return false;
    if (!activeConversation.assignedAgent) return true;
    return isAssignedToCurrentAdmin;
  }, [activeConversation, isAssignedToCurrentAdmin]);

  const emitSeen = () => {
    if (!activeId || !socketRef.current) return;
    if (document.visibilityState !== "visible") return;
    socketRef.current.emit("chat:seen", { conversationId: activeId });
  };

  useEffect(() => {
    activeIdRef.current = activeId || null;
  }, [activeId]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      setLoading(true);
      const initial = await getAdminConversations();
      if (!mounted) return;

        setConversations(initial);

      if (initial[0]) {
        const detail = await getAdminConversation(initial[0]._id);
        if (!mounted) return;
        setActiveConversation(detail.conversation);
        setMessages(detail.messages || []);
      }

      const socket = createChatSocket("admin");
      socketRef.current = socket;

      socket?.on("connect", () => {
        if (initial[0]?._id) {
          socket.emit("chat:join", { conversationId: initial[0]._id });
        }
      });

      socket?.on("chat:conversations", (payload) => {
        setConversations(payload);
      });

      socket?.on("chat:messages", (payload) => {
        if (payload.conversationId !== activeIdRef.current) return;

        setMessages((current) => mergeMessages(current, payload.messages || []));

        const hasIncomingUserMessage = (payload.messages || []).some(
          (message) => message.sender === "user"
        );

        if (hasIncomingUserMessage && document.visibilityState === "visible") {
          socket.emit("chat:seen", { conversationId: payload.conversationId });
        }
      });

      socket?.on("chat:typing", (payload) => {
        if (payload.conversationId !== activeIdRef.current) return;
        setTyping(payload.isTyping && payload.sender === "user");
      });

      socket?.on("chat:presence", (payload) => {
        setAgentOnline(Boolean(payload.agentOnline));
      });

      socket?.on("chat:status_sync", async ({ conversationId }) => {
        if (conversationId !== activeIdRef.current) return;
        const detail = await getAdminConversation(conversationId);
        if (!mounted) return;
        setMessages((current) => mergeMessages(current, detail.messages || []));
        setActiveConversation(detail.conversation);
      });

      setLoading(false);
    };

    void boot();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    if (activeId && socketRef.current) {
      socketRef.current.emit("chat:join", { conversationId: activeId });
      emitSeen();
    }
  }, [activeId]);

  useEffect(() => {
    if (!activeId || !socketRef.current) {
      return undefined;
    }

    emitSeen();
    window.addEventListener("focus", emitSeen);
    document.addEventListener("visibilitychange", emitSeen);

    return () => {
      window.removeEventListener("focus", emitSeen);
      document.removeEventListener("visibilitychange", emitSeen);
    };
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;

    const hasUnreadIncoming = messages.some(
      (message) => message.sender === "user" && message.status !== "seen"
    );

    if (hasUnreadIncoming) {
      emitSeen();
    }
  }, [messages, activeId]);

  const openConversation = async (conversationId) => {
    setErrorMessage("");
    const detail = await getAdminConversation(conversationId);
    setActiveConversation(detail.conversation);
    setMessages(detail.messages || []);
    setPendingAttachments([]);
    socketRef.current?.emit("chat:join", { conversationId });
  };

  const handleClaim = async () => {
    if (!activeId) return;
    try {
      setErrorMessage("");
      await claimAdminConversation(activeId);
      const detail = await getAdminConversation(activeId);
      setActiveConversation(detail.conversation);
      setMessages((current) => mergeMessages(current, detail.messages || []));
      const refreshed = await getAdminConversations();
      setConversations(refreshed);
      return detail.conversation;
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "This chat is already assigned to another agent."
      );
      return null;
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if ((!text && !pendingAttachments.length) || !activeId || !socketRef.current) return;

    setErrorMessage("");

    if (!activeConversation?.assignedAgent) {
      const claimed = await handleClaim();
      if (!claimed) {
        return;
      }
    }

    socketRef.current.emit(
      "chat:send",
      { conversationId: activeId, text, attachments: pendingAttachments },
      (response) => {
        if (!response?.ok) {
          setErrorMessage(response?.message || "Message could not be sent.");
          return;
        }

        setDraft("");
        setPendingAttachments([]);
      }
    );
  };

  const handleAttachmentSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAttachment(true);
      const attachment = await uploadChatAttachment(file);
      setPendingAttachments((current) => [...current, attachment]);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Attachment upload failed.");
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
      <div key={attachment.filename} className="admin-chat-attachment">
        {attachment.kind === "image" ? (
          <a href={attachment.url} target="_blank" rel="noreferrer">
            <img src={attachment.url} alt={attachment.originalName} />
          </a>
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="admin-chat-file-link"
          >
            <MdInsertDriveFile size={18} />
            <span>{attachment.originalName}</span>
          </a>
        )}
      </div>
    ));

  return (
    <div className="admin-live-chat-page">
      <div className="admin-live-chat-shell">
        <aside className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-head">
            <div>
              <p className="admin-chat-kicker">Pariva Support</p>
              <h1>Live Chats</h1>
            </div>
            <span className={`admin-chat-presence-badge ${agentOnline ? "online" : ""}`}>
              {agentOnline ? "Agents online" : "No agent online"}
            </span>
          </div>

          <div className="admin-chat-list">
            {conversations.map((conversation) => (
              <button
                key={conversation._id}
                type="button"
                className={`admin-chat-list-item ${
                  activeId === conversation._id ? "active" : ""
                }`}
                onClick={() => openConversation(conversation._id)}
              >
                <div className="admin-chat-list-top">
                  <strong>{conversation.user?.name || "Customer"}</strong>
                  <span>{conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ""}</span>
                </div>
                <p>
                  {conversation.user?.email || "No email"}
                  {" · "}
                  {conversation.lastMessagePreview || "No messages yet"}
                </p>
                <div className="admin-chat-chip-row">
                  <span className={`chat-chip ${conversation.mode}`}>{conversation.mode}</span>
                  <span className="chat-chip neutral">
                    {conversation.assignedAgent?.name || "Unassigned"}
                  </span>
                </div>
              </button>
            ))}

            {!conversations.length && !loading ? (
              <p className="admin-chat-empty">No customer conversations yet.</p>
            ) : null}
          </div>
        </aside>

        <section className="admin-chat-thread">
          {activeConversation ? (
            <>
              <header className="admin-chat-thread-head">
                <div>
                  <h2>{activeConversation.user?.name || "Customer"}</h2>
                  <p>
                    {activeConversation.user?.email || "No email"} · Last seen{" "}
                    {formatLastSeen(activeConversation.lastSeen?.user)}
                  </p>
                </div>

                <div className="admin-chat-thread-actions">
                  <span className={`chat-chip ${activeConversation.mode}`}>
                    {activeConversation.mode}
                  </span>
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={!canTakeOver}
                  >
                    {isAssignedToCurrentAdmin ? "Assigned to you" : "Take over"}
                  </button>
                </div>
              </header>

              <div className="admin-chat-thread-body" ref={scrollerRef}>
                {messages.map((message) => {
                  const mine = message.sender === "agent";

                  return (
                    <div
                      key={message.id}
                      className={`admin-chat-bubble-row ${mine ? "mine" : "theirs"}`}
                    >
                      <div className={`admin-chat-bubble ${mine ? "mine" : message.sender}`}>
                        {message.text ? <p>{message.text}</p> : null}
                        {renderAttachments(message.attachments)}
                        <div className="admin-chat-meta">
                          <span>{formatTime(message.timestamp)}</span>
                          {mine ? <MessageTick status={message.status} /> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {typing ? <p className="admin-chat-typing">User is typing...</p> : null}
              </div>

              <footer className="admin-chat-thread-footer">
                <div className="admin-chat-assignment">
                  {isAssignedToCurrentAdmin
                    ? "This customer is assigned to you."
                    : activeConversation.assignedAgent
                      ? `Assigned to ${
                          activeConversation.assignedAgent.name || "another agent"
                        }.`
                      : "Claim this chat to start replying."}
                </div>
                {errorMessage ? <div className="admin-chat-error">{errorMessage}</div> : null}
                {pendingAttachments.length ? (
                  <div className="admin-chat-pending-list">
                    {pendingAttachments.map((attachment) => (
                      <button
                        key={attachment.filename}
                        type="button"
                        className="admin-chat-pending-chip"
                        onClick={() => removePendingAttachment(attachment.filename)}
                      >
                        {attachment.kind === "image" ? (
                          <MdImage size={16} />
                        ) : (
                          <MdAttachFile size={16} />
                        )}
                        <span>{attachment.originalName}</span>
                        <strong>x</strong>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="admin-chat-input-row">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleAttachmentSelect}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="admin-chat-attach-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canReply || uploadingAttachment}
                    title="Attach image or file"
                  >
                    <MdAttachFile size={18} />
                  </button>
                  <input
                    type="text"
                    value={draft}
                    disabled={!canReply}
                    onFocus={() => {
                      if (!activeConversation?.assignedAgent) {
                        void handleClaim();
                      }
                      emitSeen();
                    }}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      socketRef.current?.emit("chat:typing", {
                        conversationId: activeId,
                        isTyping: event.target.value.trim().length > 0,
                      });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={
                      canReply
                        ? "Reply to the customer"
                        : activeConversation.assignedAgent
                          ? "This chat is locked by another agent"
                          : "Claim this chat to reply"
                    }
                  />
                  <button type="button" disabled={!canReply} onClick={sendMessage}>
                    {uploadingAttachment ? "Uploading..." : "Send"}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="admin-chat-placeholder">
              <h2>Select a conversation</h2>
              <p>Open a customer thread to start live support.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
