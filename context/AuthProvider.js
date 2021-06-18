import { useRouter } from "next/router";
import { createContext, useContext, useReducer } from "react";

export const AuthContext = createContext();

export const setUserAuth = ({ authDispatch, user, token }) => {
  localStorage?.setItem("token", JSON.stringify({ token }));
  localStorage?.setItem(
    "user",
    JSON.stringify({
      _id: user._id,
      username: user.username,
      email: user.email,
    })
  );
  authDispatch({ type: "LOGIN_USER", payload: user });
  authDispatch({ type: "ADD_TOKEN", payload: { token } });
  authDispatch({
    type: "SET_STATUS",
    payload: {
      status: { success: `Hurray! Signup Successful ${user.username}` },
    },
  });
};

export const authReducer = (state, action) => {
  console.log(state, action);
  switch (action.type) {
    case "LOGIN_USER":
      return { ...state, user: action.payload };
    case "UPDATE_USER":
      return {
        ...state,
        user: {
          ...state.user,
          portfolio: action.payload.portfolio,
          fullName: action.payload.fullName,
          interviewDone: action.payload.interviewDone,
        },
      };
    case "ADD_TOKEN":
      return { ...state, token: action.payload.token };
    case "SET_STATUS":
      return { ...state, status: action.payload.status };
    case "LOGOUT":
      return {
        token: "",
        user: null,
        status: null,
      };
    default:
      console.log(state);
      console.log("Something went wrong!");
      break;
  }
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [authState, authDispatch] = useReducer(authReducer, {
    token: "",
    user: null,
    status: null,
  });

  const signInUser = async ({ username, password, email }) => {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();
    console.log({ data });
    if (data.success) {
      setUserAuth({
        authDispatch,
        user: { username, _id: data.user._id, email },
        token: data.user.token,
      });
      router.push(`/profile/${data.user._id}`);
    }
  };

  const loginUser = async ({ username, password }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log({ data });
    if (data.success) {
      setUserAuth({
        authDispatch,
        user: data.data.user,
        token: data.data.token,
      });
      router.push(`/profile/${data.data.user._id}`);
    }
  };

  const logoutUser = () => {
    authDispatch({ type: "LOGOUT" });
    localStorage?.removeItem("token");
    localStorage?.removeItem("user");
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        authDispatch,
        signInUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
