/**
 * Generates a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : 8 + Math.floor(Math.random() * 4);
    return v.toString(16);
  });
}

/**
 * Generates a code from a name by:
 * 1. Converting to uppercase
 * 2. Removing special characters
 * 3. Replacing spaces with underscores
 * 4. Limiting to reasonable length
 */
export function generateCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 20);
}

/**
 * Generates a user-friendly code with prefix and date-based format
 */
export function generateUserFriendlyCode(prefix: string): string {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number (100000-999999)

  return `${prefix}_${day}_${month}_${year}_${randomNum}`;
}

/**
 * Generates a unique UUID code (legacy function for backward compatibility)
 */
export function generateUniqueCode(): string {
  // For UUID-based codes, we don't need to check against existing codes
  // since UUIDs are virtually guaranteed to be unique
  return generateUUID();
}

/**
 * Generates a major code with MAJ prefix
 */
export function generateMajorCode(): string {
  return generateUserFriendlyCode('MAJ');
}

/**
 * Generates a subject code with SUB prefix
 */
export function generateSubjectCode(): string {
  return generateUserFriendlyCode('SUB');
}

/**
 * Generates a class code with CLS prefix
 */
export function generateClassCode(): string {
  return generateUserFriendlyCode('CLS');
}
