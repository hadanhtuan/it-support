// src/lib/firestoreAdminHelpers.ts
import 'server-only';

import {
  DocumentData,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  WriteBatch
} from 'firebase-admin/firestore';
import { firebaseAdminDB } from './admin-config';
import { AdminFirestoreOrderByCondition, AdminFirestoreQueryCondition, AdminGetPaginateResult } from './firestore.model';

export class FirestoreAdminHelper {
  /**
   * Helper function to create a new document in a specified Firestore collection.
   * If a document ID is provided, it will set the document with that ID.
   * Otherwise, Firestore will auto-generate an ID.
   *
   * @param collectionName The path to the collection (e.g., 'users', 'products').
   * @param data The data object for the new document.
   * @param docId Optional: The ID for the new document. If not provided, Firestore generates one.
   * @returns The ID of the created document.
   * @throws Error if the operation fails.
   */
  public static async createDocument(
    collectionName: string,
    data: DocumentData,
    docId?: string
  ): Promise<string> {
    try {
      if (docId) {
        console.log('doc id', docId);
        await firebaseAdminDB.collection(collectionName).doc(docId).set(data);
        return docId;
      }
      const docRef = await firebaseAdminDB.collection(collectionName).add(data);
      return docRef.id;
    } catch (error: any) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  /**
   * Helper function to get a single document from a specified Firestore collection by its ID.
   *
   * @param collectionName The path to the collection.
   * @param docId The ID of the document to retrieve.
   * @returns The document data, or null if the document does not exist.
   * @throws Error if the operation fails.
   */
  public static async getDocument(
    collectionName: string,
    docId: string
  ): Promise<DocumentData | null> {
    try {
      const docRef = firebaseAdminDB.collection(collectionName).doc(docId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return docSnap.data() || null;
      }
      return null;
    } catch (error: any) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  /**
   * Helper function to update an existing document in a specified Firestore collection.
   *
   * @param collectionName The path to the collection.
   * @param docId The ID of the document to update.
   * @param data The partial data object to update the document with.
   * @throws Error if the operation fails or the document does not exist.
   */
  public static async updateDocument(
    collectionName: string,
    docId: string,
    data: DocumentData
  ): Promise<void> {
    try {
      const docRef = firebaseAdminDB.collection(collectionName).doc(docId);
      await docRef.update(data);
    } catch (error: any) {
      console.error(`Error updating document ${docId} in ${collectionName}:`, error);
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  /**
   * Helper function to update multiple documents in a specified Firestore collection
   * based on query conditions. Uses batched writes for efficiency and atomicity
   * for up to 500 operations.
   *
   * @param collectionName The path to the collection.
   * @param conditions An array of AdminFirestoreQueryCondition to filter the documents to update.
   * @param updateData The partial data object to update the matching documents with.
   * @returns A Promise resolving to the number of documents updated.
   * @throws Error if the operation fails or if trying to update more than 500 documents in one call without handling pagination.
   */
  public static async updateMany(
    collectionName: string,
    conditions: Array<AdminFirestoreQueryCondition>,
    updateData: DocumentData
  ): Promise<number> {
    try {
      if (!conditions || conditions.length === 0) {
        throw new Error('updateMany requires at least one query condition to identify documents.');
      }

      let query: Query = firebaseAdminDB.collection(collectionName);

      // Apply all 'where' conditions
      conditions.forEach((condition) => {
        query = query.where(condition.field, condition.op, condition.value);
      });

      // --- Important: Limit for Batched Writes ---
      // Firestore batches are limited to 500 operations.
      // If you expect more than 500 documents, you'll need to implement pagination
      // and execute multiple batches. For simplicity, this example will limit to 500
      // and throw an error if more are found, or you can add a 'limit' option.
      const querySnapshot: QuerySnapshot = await query.limit(500).get(); // Add a limit to prevent processing too many at once

      if (querySnapshot.empty) {
        console.error(`No documents found to update in ${collectionName} with given conditions.`);
        return 0;
      }

      // If you're okay with updating more than 500 in batches (e.g., in a background job),
      // you would loop and commit batches here.
      if (querySnapshot.size >= 500) {
        console.warn(`Attempting to update ${querySnapshot.size} documents. `
                       + 'Firestore batch writes are limited to 500. '
                       + 'Consider implementing pagination for larger updates, '
                       + 'or ensure your query is sufficiently specific.');
        // Optionally, throw an error if you want to enforce the limit:
        // throw new Error(`Query returned ${querySnapshot.size} documents, exceeding batch limit of 500.`);
      }

      const batch: WriteBatch = firebaseAdminDB.batch();
      let updatedCount = 0;

      querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
        batch.update(doc.ref, updateData);
        updatedCount += 1;
      });

      await batch.commit();
      return updatedCount;
    } catch (error: any) {
      console.error(`Error updating many documents in ${collectionName}:`, error);
      throw new Error(`Failed to update multiple documents: ${error.message}`);
    }
  }

  /**
   * Helper function to delete a document from a specified Firestore collection.
   *
   * @param collectionName The path to the collection.
   * @param docId The ID of the document to delete.
   * @throws Error if the operation fails.
   */
  public static async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<void> {
    try {
      const docRef = firebaseAdminDB.collection(collectionName).doc(docId);
      await docRef.delete();
    } catch (error: any) {
      console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  public static async getMany<T>(
    collectionName: string,
    options: {
      conditions: Array<AdminFirestoreQueryCondition>;
      orderBy?: Array<AdminFirestoreOrderByCondition>;
      limitCount?: number;
      lastDoc?: DocumentSnapshot<T>; // Correct type for pagination
      limitToLastBool?: boolean;
    },
  ): Promise<AdminGetPaginateResult<T>> {
    try {
      let query: Query = firebaseAdminDB.collection(collectionName);

      // Apply all 'where' conditions
      options.conditions.forEach((condition) => {
        query = query.where(condition.field, condition.op, condition.value);
      });

      options.orderBy?.forEach((condition) => {
        query = query.orderBy(condition.field, condition.op);
      });

      if (options?.lastDoc) {
        query = query.startAfter(options.lastDoc);
      }

      const querySnapshot: QuerySnapshot = await query.get();
      const documents: DocumentData[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
        documents.push({ id: doc.id, ...doc.data() }); // Include doc.id in the returned data
      });
      return {
        documents: documents as T[],
        lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      };
    } catch (error: any) {
      console.error(`Error querying collection ${collectionName}:`, error);
      throw new Error(`Failed to query collection: ${error.message}`);
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
    conditions: Array<AdminFirestoreQueryCondition>,
  ): Promise<T | null> {
    try {
      if (!conditions || conditions.length === 0) {
        throw new Error('getOne requires at least one query condition to identify a unique document.');
      }

      let query: Query = firebaseAdminDB.collection(collectionName);

      // Apply all 'where' conditions
      conditions.forEach((condition) => {
        query = query.where(condition.field, condition.op, condition.value);
      });

      // Limit to 1 to ensure we only get one result efficiently
      query = query.limit(1);

      const querySnapshot: QuerySnapshot = await query.get();

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
