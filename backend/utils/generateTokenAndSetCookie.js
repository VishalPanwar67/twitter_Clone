import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  // Set 'jwt' cookie with token value
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // Expires in 15 days
    httpOnly: true, // Accessible only by web server
    sameSite: "strict", // Strictly same-site requests
    secure: process.env.NODE_ENV !== "development", // HTTPS if not in dev mode
  });
};
