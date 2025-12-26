// types/admin-firestore.ts
// This file should ONLY be imported in server-side contexts.

import { DocumentSnapshot as AdminDocumentSnapshot,
  WhereFilterOp as AdminWhereFilterOp,
  OrderByDirection as AdminOrderByDirection
} from 'firebase-admin/firestore';

// You might re-export or define common types here that are also used client-side
// if you want to reuse the definition, but make sure they don't bring in admin deps.
// export type { DocumentTimestamps } from './client-firestore'; // Example of reusing a truly shared type

/**
 * Represents a Firestore 'where' condition for admin-side use.
 */
export type AdminFirestoreQueryCondition = { field: string; op: AdminWhereFilterOp; value: any };

/**
 * Represents a Firestore 'orderBy' condition for admin-side use.
 */
export type AdminFirestoreOrderByCondition = { field: string; op: AdminOrderByDirection };

/**
 * Represents a document retrieved from Firestore admin-side.
 */
export interface AdminGetPaginateResult<T> {
  documents: T[];
  lastDoc: AdminDocumentSnapshot | null;
}
