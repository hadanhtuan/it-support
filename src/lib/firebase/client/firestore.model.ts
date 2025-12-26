// types/client-firestore.ts

import { DocumentSnapshot, OrderByDirection, WhereFilterOp } from 'firebase/firestore';

/**
 * Represents the valid operators for Firestore 'where' clauses (client-side specific if needed).
 */
export type ClientFirestoreQueryOperator =
  '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' |
  'array-contains-any' | 'in' | 'not-in';

/**
 * Represents a Firestore 'where' condition for client-side use.
 */
export type ClientFirestoreQueryCondition = { field: string; op: WhereFilterOp; value: any };

/**
 * Represents a Firestore 'orderBy' condition for client-side use.
 */
export type ClientFirestoreOrderByCondition = { field: string; op: OrderByDirection };

/**
 * Represents a document retrieved from Firestore client-side, including its ID.
 */
export interface ClientGetPaginateResult<T> {
  documents: T[];
  lastDoc: DocumentSnapshot<T> | null;
}

/**
 * Optional interface for timestamps.
 */
export interface DocumentTimestamps {
  createdAt?: Date;
  updatedAt?: Date;
}
