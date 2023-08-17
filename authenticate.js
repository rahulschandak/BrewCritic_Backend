import passport from "passport";
import jwt from "jsonwebtoken";

export const COOKIE_OPTION = {
  sameSite: "none",
  signed: true,
  secure: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  httpOnly: true,
};

export const getToken = (userToSign) =>
  jwt.sign(userToSign, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.SESSION_EXPIRY),
  });

export const getRefreshToken = (userToSign) =>
  jwt.sign(userToSign, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });

export const verifyUser = passport.authenticate("jwt", { session: false });
