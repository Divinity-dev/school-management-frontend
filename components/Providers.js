"use client";

import { Provider } from "react-redux";

import { store } from "../store/store";
import AuthInitializer from "./AuthInitializer";
import GlobalFeedback from "./GlobalFeedback";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
      <GlobalFeedback />
    </Provider>
  );
}