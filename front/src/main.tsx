import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { Home } from "./pages/home";
import { SignIn } from "./pages/signin";
import { ClerkProvider } from "@clerk/clerk-react";
import { AppBar } from "./components/AppBar";
// import { SignUp } from "./pages/signup";
import { Onboard } from "./pages/onboard";
import { UsersPage } from "./pages/users";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
      <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          {/* <Route path="/sign-up" element={<SignUp />} /> */}
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
