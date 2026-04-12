import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthPromptContext = createContext(null);

const DEFAULT_MESSAGE = "Please sign in to continue with this action.";

export function AuthPromptProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const [prompt, setPrompt] = useState({
    open: false,
    message: DEFAULT_MESSAGE,
  });

  const hideAuthPrompt = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setPrompt((current) => ({ ...current, open: false }));
  }, []);

  const showAuthPrompt = useCallback((message = DEFAULT_MESSAGE) => {
    window.clearTimeout(timerRef.current);
    setPrompt({
      open: true,
      message,
    });

    timerRef.current = window.setTimeout(() => {
      setPrompt((current) => ({ ...current, open: false }));
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      showAuthPrompt,
      hideAuthPrompt,
    }),
    [showAuthPrompt, hideAuthPrompt]
  );

  return (
    <AuthPromptContext.Provider value={value}>
      {children}

      {prompt.open ? (
        <div className="auth-prompt-toast" role="status" aria-live="polite">
          <div className="auth-prompt-toast__copy">
            <span className="auth-prompt-toast__eyebrow">Member Access</span>
            <p>{prompt.message}</p>
          </div>

          <div className="auth-prompt-toast__actions">
            <button
              type="button"
              className="auth-prompt-toast__link"
              onClick={() => {
                hideAuthPrompt();
                navigate("/login", {
                  state: {
                    from: location.pathname,
                  },
                });
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className="auth-prompt-toast__close"
              onClick={hideAuthPrompt}
              aria-label="Dismiss sign in notice"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);

  if (!context) {
    throw new Error("useAuthPrompt must be used within an AuthPromptProvider");
  }

  return context;
}
