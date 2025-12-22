import crypto from "crypto";

//TYPES
interface EncryptedDataBlock {
  encryptedData: string;
  initializationVector: string;
  authTag: string;
}

// CONFIG
const IV_LEN = 16;
const ENCRYPTION_KEY_HEX = process.env.MASTER_ENCRYPTION_KEY;
const ALGORITHM: crypto.CipherGCMTypes = "aes-256-gcm";

if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
  throw new Error(
    "ENCRYPTION_KEY environment variable is not a valid 64 characters hex key",
  );
}

const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex");

export function EncryptString256(text: string): EncryptedDataBlock {
  // Create a random IV to ensure uniqueness of encryption
  const iv = crypto.randomBytes(IV_LEN);

  // Create cipher object to encrypt data
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = cipher.update(text, "utf-8", "hex") + cipher.final("hex"); // cipher.final calculates the last, incomplete chunk of data.

  // Create an authTag used to verify the integrity of the encrypted data
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedData: encrypted,
    initializationVector: iv.toString("hex"),
    authTag: authTag,
  };
}

export function DecryptString256(
  encryptedDataBlock: EncryptedDataBlock,
): string {
  // Construct iv and authTag buffers from stored hex
  const iv = Buffer.from(encryptedDataBlock.initializationVector, "hex");
  const authTag = Buffer.from(encryptedDataBlock.authTag, "hex");

  const encryptedText = encryptedDataBlock.encryptedData;

  // Create decipher object to decrypt data
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag); // Set authTag before decryption to verify integrity

  const decrypted =
    decipher.update(encryptedText, "hex", "utf-8") + decipher.final("utf-8"); // decipher.final calculates the last, incomplete chunk of encrypted data

  return decrypted;
}
