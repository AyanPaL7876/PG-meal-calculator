"use client";
import { logOut } from "../services/authService";

export default function SignOut() {
  return (
    <button
      onClick={logOut}
      className="bg-red-500 text-white px-4 py-2 rounded-md"
    >
      Sign Out
    </button>
  );
}
