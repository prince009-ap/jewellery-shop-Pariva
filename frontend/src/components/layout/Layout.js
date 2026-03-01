// src/components/layout/Layout.js
import React from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <TopBar />
      <Header />
      <main className="page-main">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;