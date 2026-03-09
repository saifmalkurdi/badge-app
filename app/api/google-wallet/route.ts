import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!;
const CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID!;
const WALLET_BASE = "https://walletobjects.googleapis.com/walletobjects/v1";

// ---------------------------------------------------------------------------
// Builds the Generic Pass class body
// ---------------------------------------------------------------------------
function buildClassBody() {
  return {
    id: CLASS_ID,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#4f46e5",
    cardTitle: {
      defaultValue: { language: "en-US", value: "Event Badge" },
    },
  };
}

// ---------------------------------------------------------------------------
// Builds the Generic Pass object body
// ---------------------------------------------------------------------------
function buildObjectBody(badge: {
  id: string;
  name: string;
  age: string;
  title: string;
}) {
  const objectId = `${ISSUER_ID}.${badge.id.replace(/-/g, "_")}`;
  return {
    id: objectId,
    classId: CLASS_ID,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#4f46e5",
    cardTitle: {
      defaultValue: { language: "en-US", value: badge.title },
    },
    subheader: {
      defaultValue: { language: "en-US", value: "Event Badge" },
    },
    header: {
      defaultValue: { language: "en-US", value: badge.name },
    },
    textModulesData: [
      { id: "age", header: "Age", body: badge.age },
      { id: "badge_id", header: "Badge ID", body: badge.id },
    ],
    barcode: { type: "QR_CODE", value: badge.id },
    state: "ACTIVE",
  };
}

// ---------------------------------------------------------------------------
// POST /api/google-wallet
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, age, title } = body as {
      id: string;
      name: string;
      age: string;
      title: string;
    };

    if (!id || !name || !age || !title) {
      return NextResponse.json(
        { error: "Missing required badge fields" },
        { status: 400 },
      );
    }

    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n",
      ),
    };

    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authClient = (await auth.getClient()) as any;

    // 1. Ensure the class exists
    try {
      await authClient.request({
        url: `${WALLET_BASE}/genericClass/${encodeURIComponent(CLASS_ID)}`,
        method: "GET",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (classErr: any) {
      const status = classErr?.response?.status ?? classErr?.status;
      if (status === 404) {
        await authClient.request({
          url: `${WALLET_BASE}/genericClass`,
          method: "POST",
          data: buildClassBody(),
        });
      } else {
        throw new Error(
          `Class check failed: ${status} — ${JSON.stringify(classErr?.response?.data ?? classErr?.message)}`,
        );
      }
    }

    // 2. Create or update the pass object
    const objectBody = buildObjectBody({ id, name, age, title });
    const objectId = objectBody.id;

    try {
      await authClient.request({
        url: `${WALLET_BASE}/genericObject/${encodeURIComponent(objectId)}`,
        method: "GET",
      });
      // object exists — patch it
      await authClient.request({
        url: `${WALLET_BASE}/genericObject/${encodeURIComponent(objectId)}`,
        method: "PATCH",
        data: objectBody,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (objErr: any) {
      const status = objErr?.response?.status ?? objErr?.status;
      if (status === 404) {
        await authClient.request({
          url: `${WALLET_BASE}/genericObject`,
          method: "POST",
          data: objectBody,
        });
      } else {
        throw new Error(
          `Object check failed: ${status} — ${JSON.stringify(objErr?.response?.data ?? objErr?.message)}`,
        );
      }
    }

    // 3. Sign a JWT that references the existing object by ID
    const host =
      req.headers.get("x-forwarded-host") ??
      req.headers.get("host") ??
      "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const appOrigin = req.headers.get("origin") ?? `${proto}://${host}`;

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      aud: "google",
      typ: "savetowallet",
      iat: now,
      exp: now + 3600,
      origins: [appOrigin],
      payload: {
        genericObjects: [{ id: objectId }],
      },
    };

    const jwt = await signJwt(credentials, jwtPayload);
    return NextResponse.json({
      saveUrl: `https://pay.google.com/gp/v/save/${jwt}`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const detail = err?.response?.data ?? err?.message ?? String(err);
    console.error("[google-wallet] error:", JSON.stringify(detail, null, 2));
    return NextResponse.json(
      { error: typeof detail === "string" ? detail : JSON.stringify(detail) },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Sign a JWT with the service-account private key (RS256, Web Crypto API)
// ---------------------------------------------------------------------------
async function signJwt(
  credentials: { client_email: string; private_key: string },
  payload: object,
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const signingInput = `${encode(header)}.${encode(payload)}`;

  const pemKey = credentials.private_key
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, "-----BEGIN PRIVATE KEY-----")
    .replace(/-----END RSA PRIVATE KEY-----/, "-----END PRIVATE KEY-----");

  const binaryKey = Buffer.from(
    pemKey
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, ""),
    "base64",
  );

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await globalThis.crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signingInput),
  );

  const sig = Buffer.from(signature)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signingInput}.${sig}`;
}
