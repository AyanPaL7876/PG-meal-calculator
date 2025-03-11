import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { setCookie } from "nookies";

const SECRET_KEY = process.env.JWT_SECRET_KEY as string; // Store in .env file

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { uid, role, email } = req.body;

    // Generate JWT token
    const token = jwt.sign({ uid, role, email }, SECRET_KEY, { expiresIn: "7d" });

    // Store token in cookies
    setCookie({ res }, "token", token, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("JWT Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
