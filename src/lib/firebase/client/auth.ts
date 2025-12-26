import { getAuth } from 'firebase/auth';
import {  firebaseApp } from './client-config';

export const auth = getAuth(firebaseApp);
