import "./App.css";
import { Routes, Route } from "react-router-dom";

import {
  HomePage,
  SignUpPage,
  LoginPage,
  NotificationPage,
  ProfilePage,
} from "./pages/index.Pages.js";

import { RightPanel, Sidebar } from "./components/index.Components.js";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>

      <RightPanel />
      <Toaster />
    </div>
  );
}

export default App;
