import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET environment variable is not available");
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = getJwtSecret();
    const result = jwt.verify(token, secret) as JWTPayload;
    return result;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;

  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
