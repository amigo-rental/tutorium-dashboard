// Edge Runtime compatible JWT functions
import { JWTPayload } from "./jwt";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET environment variable is not available");
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

// Base64 URL encoding
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64 URL decoding
function base64UrlDecode(str: string): string {
  str += '='.repeat(4 - str.length % 4);
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

// Create HMAC signature using Web Crypto API
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = new Uint8Array(signature);
  return base64UrlEncode(String.fromCharCode.apply(null, Array.from(signatureArray)));
}

// Verify HMAC signature using Web Crypto API
async function verifySignature(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signatureData = new Uint8Array(
    Array.from(base64UrlDecode(signature)).map(char => char.charCodeAt(0))
  );

  return await crypto.subtle.verify('HMAC', key, signatureData, messageData);
}

export async function generateTokenEdge(payload: JWTPayload): Promise<string> {
  const secret = getJwtSecret();
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  
  const signature = await createSignature(data, secret);
  
  return `${data}.${signature}`;
}

export async function verifyTokenEdge(token: string): Promise<JWTPayload> {
  try {
    const secret = getJwtSecret();
    console.log("Verifying token (Edge):", token.substring(0, 30) + "...", "Secret length:", secret.length);

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const isValid = await verifySignature(data, signature, secret);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    console.log("Token verification successful (Edge) for user:", payload.userId);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.log("Token verification failed (Edge):", error);
    throw new Error("Invalid token");
  }
}
