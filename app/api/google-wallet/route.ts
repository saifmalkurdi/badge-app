import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

// ---------------------------------------------------------------------------
// POST /api/google-wallet
// Body: { id, name, age, title, imageUrl }
// Returns: { saveUrl: "https://pay.google.com/gp/v/save/<jwt>" }
// ---------------------------------------------------------------------------

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!;
const CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID!;

function buildPassPayload(badge: {
  id: string;
  name: string;
  age: string;
  title: string;
}) {
  const objectId = `${ISSUER_ID}.${badge.id.replace(/-/g, "_")}`;

  return {
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    aud: "google",
    typ: "savetowallet",
    origins: [],
    payload: {
      genericObjects: [
        {
          id: objectId,
          classId: CLASS_ID,
          genericType: "GENERIC_TYPE_UNSPECIFIED",
          hexBackgroundColor: "#4f46e5", // indigo-600
          logo: {
            sourceUri: {
              uri: "https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg",
            },
          },
          cardTitle: {
            defaultValue: {
              language: "en-US",
              value: badge.title,
            },
          },
          subheader: {
            defaultValue: {
              language: "en-US",
              value: "Badge ID",
            },
          },
          header: {
            defaultValue: {
              language: "en-US",
              value: badge.name,
            },
          },
          textModulesData: [
            {
              id: "age",
              header: "Age",
              body: badge.age,
            },
            {
              id: "badge_id",
              header: "UUID",
              body: badge.id,
            },
          ],
          barcode: {
            type: "QR_CODE",
            value: badge.id,
          },
          state: "ACTIVE",
        },
      ],
    },
  };
}

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

    // Build credentials from env vars
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

    // Verify credentials are valid by getting the client (throws if misconfigured)
    await auth.getClient();

    const payload = buildPassPayload({ id, name, age, title });

    // Use the JWT signing approach: encode and sign manually
    const jwt = await signJwt(credentials, payload);

    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;
    return NextResponse.json({ saveUrl });
  } catch (err) {
    console.error("[google-wallet] error:", err);
    return NextResponse.json(
      { error: "Failed to generate Google Wallet pass" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Sign a Google Wallet JWT with the service-account private key
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

  // Import the RSA private key
  const pemKey = credentials.private_key;
  const keyData = pemKey
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, "-----BEGIN PRIVATE KEY-----")
    .replace(/-----END RSA PRIVATE KEY-----/, "-----END PRIVATE KEY-----");

  const binaryKey = Buffer.from(
    keyData
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
