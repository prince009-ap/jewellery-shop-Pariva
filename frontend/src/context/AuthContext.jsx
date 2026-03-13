import { createContext, useContext, useReducer, useEffect } from "react";
import API from "../services/api";
import {
  clearUserSession,
  getStoredUser,
  getUserToken,
  migrateLegacyUserSession,
  setUserSession,
} from "../utils/authStorage";

const AuthContext = createContext();
migrateLegacyUserSession();
const storedUser = getStoredUser();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const storedToken = getUserToken();

  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: Boolean(storedToken && storedUser),
    user: storedUser,
    token: storedToken,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (state.token) {
      setUserSession(state.user, state.token);
    } else {
      clearUserSession();
    }
  }, [state.token, state.user]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = getUserToken();
      if (token) {
        try {
          const response = await API.get("/auth/me", { skipLoader: true });
          const userPayload = response.data?.user || response.data;
          const safeUser =
            userPayload && typeof userPayload === "object"
              ? userPayload
              : storedUser;
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: safeUser,
              token: token,
            },
          });
        } catch (error) {
          console.error("Load user error:", error);
          dispatch({ type: "AUTH_ERROR", payload: "Session expired" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadUser();
  }, []);

  const login = async (emailOrUser, passwordOrToken) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Supports direct session hydration: login(userObject, token)
      if (
        emailOrUser &&
        typeof emailOrUser === "object" &&
        typeof passwordOrToken === "string"
      ) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: emailOrUser,
            token: passwordOrToken,
          },
        });
        return { user: emailOrUser, token: passwordOrToken };
      }

      const response = await API.post("/auth/login", {
        email: String(emailOrUser || "").trim().toLowerCase(),
        password: passwordOrToken,
      });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error.response?.data?.message || "Login failed",
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await API.post("/auth/register", userData);
      
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error.response?.data?.message || "Registration failed",
      });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    clearUserSession();
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
