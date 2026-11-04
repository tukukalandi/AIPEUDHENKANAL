import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Target Google Drive folder specified by the user
export const TARGET_GOOGLE_DRIVE_FOLDER_ID = '1XIKgUxuVj02KnDwX6qp4slvEDEF8RHWR';
export const TARGET_GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1XIKgUxuVj02KnDwX6qp4slvEDEF8RHWR?usp=sharing';

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  webContentLink?: string;
  size?: string;
  mimeType?: string;
}

/**
 * Initializes the Google Drive auth state listener.
 */
export const initDriveAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      if (onFailure) onFailure();
    }
  });
};

/**
 * Signs in with Google to obtain an OAuth token with drive.file scope.
 */
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token from sign in');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns currently cached in-memory access token.
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Disconnects / logs out from Google Drive session.
 */
export const logoutGoogleDrive = async () => {
  cachedAccessToken = null;
  await signOut(auth).catch(() => {});
};

/**
 * Directly uploads a file into the user's designated Google Drive folder.
 * Uses Google Drive v3 multipart upload and sets public link permissions.
 */
export async function uploadFileToGoogleDrive(
  file: File,
  folderId: string = TARGET_GOOGLE_DRIVE_FOLDER_ID,
  onStatusUpdate?: (status: string) => void
): Promise<DriveUploadResult> {
  let token = cachedAccessToken;
  if (!token) {
    if (onStatusUpdate) onStatusUpdate('Authorizing Google Drive access...');
    const authResult = await signInWithGoogleDrive();
    token = authResult.accessToken;
  }

  if (onStatusUpdate) onStatusUpdate(`Uploading "${file.name}" to Google Drive folder...`);

  const boundary = '-------aipeu_dhenkanal_drive_upload_boundary_92311';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    parents: [folderId],
  };

  const multipartRequestBody = new Blob(
    [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      JSON.stringify(metadata),
      delimiter,
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
      file,
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size,mimeType',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json().catch(() => ({}));
    console.error('Google Drive API upload failed:', errorData);

    if (uploadRes.status === 401) {
      cachedAccessToken = null;
      throw new Error('Google Drive session expired. Please click upload again to re-authorize.');
    }

    throw new Error(
      errorData.error?.message ||
        `Google Drive upload failed with status code ${uploadRes.status}. Check folder permissions.`
    );
  }

  const fileData = await uploadRes.json();
  const fileId = fileData.id;

  if (onStatusUpdate) onStatusUpdate('Making file viewable for visitors...');

  // Set file permissions so anyone with the link can view/preview the document
  try {
    const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
    if (!permRes.ok) {
      console.warn('Google Drive set permission returned non-200:', permRes.status);
    }
  } catch (permErr) {
    console.warn('Could not set public permission on Drive file:', permErr);
  }

  // Generate standardized share/view URL
  const viewLink =
    fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

  return {
    fileId,
    fileName: fileData.name || file.name,
    webViewLink: viewLink,
    webContentLink: fileData.webContentLink,
    size: fileData.size,
    mimeType: fileData.mimeType,
  };
}
