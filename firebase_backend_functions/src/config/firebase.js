/**
 * Firebase Admin initialization for backend server.
 * Exposes initialized instances: admin, db (Firestore), and auth (AdminAuth).
 * This uses either GOOGLE_APPLICATION_CREDENTIALS or inline FIREBASE_SERVICE_ACCOUNT_JSON.
 */
const path = require('path');
const admin = require('firebase-admin');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config();

// PUBLIC_INTERFACE
function getAllowedOrigins() {
  /** Returns an array of allowed origins parsed from ALLOWED_ORIGIN env var. */
  const raw = process.env.ALLOWED_ORIGIN || '';
  return raw
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
}

/**
 * Attempt to initialize Firebase Admin only once.
 * Prefer inline JSON via FIREBASE_SERVICE_ACCOUNT_JSON; else use GOOGLE_APPLICATION_CREDENTIALS if set;
 * as a last resort fall back to default credentials (useful on GCP environments).
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    // Not throwing to avoid crashing during local development when not used yet,
    // but we log a clear warning.
    console.warn(
      '[firebase] FIREBASE_PROJECT_ID is not set. Firestore may fail when accessed.'
    );
  }

  const inlineServiceJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    if (inlineServiceJson) {
      let serviceAccount;
      try {
        // If secret is provided as JSON string
        serviceAccount = JSON.parse(inlineServiceJson);
      } catch (e) {
        // If secret may be provided via file path content injected as multi-line; try reading as file
        if (fs.existsSync(inlineServiceJson)) {
          const content = fs.readFileSync(inlineServiceJson, 'utf8');
          serviceAccount = JSON.parse(content);
        } else {
          throw new Error(
            'FIREBASE_SERVICE_ACCOUNT_JSON is neither valid JSON nor a readable file path'
          );
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
      });
    } else if (credsPath) {
      const absolutePath = path.isAbsolute(credsPath)
        ? credsPath
        : path.join(process.cwd(), credsPath);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(
          `GOOGLE_APPLICATION_CREDENTIALS file not found at ${absolutePath}`
        );
      }
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId,
      });
    } else {
      // Use default credentials (useful in GCP/Cloud Functions)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId,
      });
    }
  } catch (error) {
    console.error('[firebase] Failed to initialize Firebase Admin:', error.message);
    throw error;
  }

  return admin.app();
}

// Initialize on import
const app = initializeFirebaseAdmin();

// Get Firestore and Auth references
const db = admin.firestore();
const auth = admin.auth();

// Export references for use across controllers and middleware
module.exports = {
  admin,
  db,
  auth,
  getAllowedOrigins,
};
