import { clsx, type ClassValue } from 'clsx';
import { Timestamp } from 'firebase/firestore';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getStoragePathPerDocument(collection: string, documentId: string, type: string): string {
  return `${collection}/${documentId}/${type}`;
}

export function formatFirestoreTimestamp(timestamp: any): string {
  const d: Timestamp = timestamp as Timestamp;
  return d?.toDate()
    ? d.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toDateString();
}

export function convertTimestampToDate(timestamp: any): Date {
  const d: Timestamp = timestamp as Timestamp;
  return d?.toDate() ?? new Date();
}

export function toVND(money: number): string {
  return money.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
}
