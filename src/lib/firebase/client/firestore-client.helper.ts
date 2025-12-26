/* eslint-disable no-console */
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  Query,
  QueryDocumentSnapshot,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import {
  ClientFirestoreOrderByCondition,
  ClientFirestoreQueryCondition,
  ClientGetPaginateResult
} from './firestore.model';
import { firebaseDB } from './client-config';

export class FirestoreClientHelper {
  /**
   * Creates a new document in a specified Firestore collection.
   * @param {string} collectionName - The name of the collection.
   * @param {object} data - The data for the new document.
   * @param {string | undefined} docId - Document Id.
   * @returns {Promise<string>} The ID of the newly created document.
   */
  public static async createDocument<T extends object>(
    collectionName: string,
    data: T,
    docId?: string
  ): Promise<string> {
    try {
      if (docId) {
        // If a specific document ID is provided, set the document with that ID
        const docRef = doc(firebaseDB, collectionName, docId);

        await setDoc(docRef, {
          ...data,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        });
        return docId;
      }

      const docRef = await addDoc(collection(firebaseDB, collectionName), {
        ...data,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document.');
    }
  }

  /**
   * Retrieves a single document by its ID from a specified collection.
   * @param {string} collectionName - The name of the collection.
   * @param {string} id - The ID of the document to retrieve.
   * @returns {Promise<object | null>} The document data with its ID, or null if not found.
   */
  public static async getItemById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(firebaseDB, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      throw new Error('Failed to retrieve document by ID.');
    }
  }

  /**
   * Updates an existing document in a specified collection.
   * @param {string} collectionName - The name of the collection.
   * @param {string} id - The ID of the document to update.
   * @param {object} newData - The new data to update the document with.
   * @returns {Promise<void>}
   */
  public static async updateDocument<T>(collectionName: string, id: string, newData: T): Promise<void> {
    try {
      // Remove undefined values (Firestore doesn't accept undefined)
      const cleanedData = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(newData as object).filter(([_, value]) => value !== undefined)
      );

      const docRef = doc(firebaseDB, collectionName, id);
      await updateDoc(docRef, {
        ...cleanedData,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document.');
    }
  }

  /**
   * Deletes a document from a specified collection.
   * @param {string} collectionName - The name of the collection.
   * @param {string} id - The ID of the document to delete.
   * @returns {Promise<void>}
   */
  public static async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(firebaseDB, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document.');
    }
  }

  /**
   * Retrieves multiple documents from a specified Firestore collection with optional queries.
   * @template T The expected type of the document data.
   * @param {string} collectionName - The name of the collection.
   * @param {object} [options] - Optional query options.
   * @param [options.conditions=[]] - An array of query conditions, e.g., [['field', '==', 'value']].
   * @param [options.orderByConditions=[]] - An array of orderBy conditions, e.g., [['field', 'asc']].
   * @param {number} [options.limitCount] - Optional limit for the number of documents.
   * @param {DocumentSnapshot<T>} [options.startAfterDoc] - Optional document snapshot to start results after (for pagination).
   * @param {DocumentSnapshot<T>} [options.endBeforeDoc] - Optional document snapshot to end results before (for pagination).
   * @param {boolean} [options.limitToLastBool=false] - If true, limits to the last 'limitCount' documents (requires orderBy).
   * @returns {Promise<ClientGetPaginateResult<T>>} A Promise that resolves with an array of document data with their IDs.
   */
  public static async getMany<T extends object>(
    collectionName: string,
    options: {
      conditions: Array<ClientFirestoreQueryCondition>;
      orderBy?: Array<ClientFirestoreOrderByCondition>;
      limitCount?: number;
      lastDoc?: DocumentSnapshot<T>; // Correct type for pagination
      limitToLastBool?: boolean;
    }
  ): Promise<ClientGetPaginateResult<T>> {
    try {
      const {
        conditions = [],
        orderBy: orderByConditions = [],
        limitCount,
        lastDoc,
        limitToLastBool = false
      } = options;

      let qRef: Query<T> = query(collection(firebaseDB, collectionName) as CollectionReference<T>);

      // Apply conditions
      conditions.forEach((condition) => {
        qRef = query(qRef, where(condition.field, condition.op, condition.value));
      });

      // Apply orderBy
      orderByConditions.forEach((condition) => {
        qRef = query(qRef, orderBy(condition.field, condition.op));
      });

      // Apply pagination and limits
      if (lastDoc) {
        qRef = query(qRef, startAfter(lastDoc));
      }
      if (limitCount) {
        if (limitToLastBool) {
          if (!orderByConditions.length) {
            throw new Error("getMany with 'limitToLastBool' requires at least one 'orderByCondition'.");
          }
          qRef = query(qRef, limitToLast(limitCount));
        } else {
          qRef = query(qRef, limit(limitCount));
        }
      }

      const querySnapshot = await getDocs(qRef);
      const documents: T[] = [];
      querySnapshot.forEach((docSnap: QueryDocumentSnapshot<T>) => {
        // Use docSnap.data() as T to ensure type safety.
        // Firestore provides QueryDocumentSnapshot<DocumentData> by default,
        // but we explicitly cast to our generic T.
        documents.push({ id: docSnap.id, ...(docSnap.data() as T) });
      });
      // return documents;
      return {
        documents,
        lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
      };
    } catch (error) {
      console.error('Error getting many documents:', error);
      throw new Error('Failed to retrieve multiple documents.');
    }
  }

  /**
   * Retrieves a single document based on a query.
   * Useful when you expect only one document to match specific criteria (e.g., getting a user by email).
   * @template T The expected type of the document data.
   * @param {string} collectionName - The name of the collection.
   * @param {} conditions - An array of query conditions, e.g., [['field', '==', 'value']].
   * Must provide at least one condition.
   * @returns {Promise<FirestoreDocument<T> | null>} A Promise that resolves with the document data with its ID, or null if not found.
   */
  public static async getOne<T extends object>(
    collectionName: string,
    conditions: Array<ClientFirestoreQueryCondition>
  ): Promise<T | null> {
    try {
      if (!conditions || conditions.length === 0) {
        throw new Error('getOne requires at least one query condition to identify a unique document.');
      }

      let qRef: Query<T> = query(collection(firebaseDB, collectionName) as CollectionReference<T>);

      // Apply conditions
      conditions.forEach((condition) => {
        qRef = query(qRef, where(condition.field, condition.op, condition.value));
      });

      // Limit to 1 to ensure we only get one result efficiently
      qRef = query(qRef, limit(1));

      const querySnapshot = await getDocs(qRef);

      if (!querySnapshot.empty) {
        // There should only be one document if limit(1) is applied and a match exists
        const docSnap = querySnapshot.docs[0] as QueryDocumentSnapshot<T>; // Cast for type safety
        return { id: docSnap.id, ...(docSnap.data() as T) };
      }
      return null;
    } catch (error) {
      console.error('Error getting one document:', error);
      throw new Error('Failed to retrieve a single document by query.');
    }
  }
}
