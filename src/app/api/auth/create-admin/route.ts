import { Collection, SignInMethod, UserRole, UserStatus } from '@/lib/core/models';
import { firebaseAdminAuth } from '@/lib/firebase/server/admin-config';
import { FirestoreAdminHelper } from '@/lib/firebase/server/firestore-admin.helper';
import { CreateAdminRequest } from '@/services/models/requests/auth';
import { UserRecord } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body: CreateAdminRequest = await request.json();

  const { email, fullname, password } = body;

  try {
    // Validate the request body
    if (!email || !password) {
      return NextResponse.json({ message: 'Email, uid, fullname and role are required.' }, { status: 400 });
    }

    const isEmailExist = await FirestoreAdminHelper.getOne(
      Collection.USERS,
      [{ field: 'email', op: '==', value: email }]
    );

    if (isEmailExist) {
      return NextResponse.json({ message: 'Email already exists.' }, { status: 400 });
    }

    const adminCredential : UserRecord = await firebaseAdminAuth.createUser({
      email,
      password,
      displayName: fullname,
      emailVerified: true,
    });

    await FirestoreAdminHelper.createDocument(Collection.USERS, {
      uid: adminCredential.uid,
      id: adminCredential.uid,
      email,
      fullname,
      role: UserRole.ADMIN,
      isProfileCompleted: true,
      signInMethod: SignInMethod.EMAIL_PASSWORD,
      status: UserStatus.ACTIVE,
      createdAt: Timestamp.fromDate(new Date()),
    }, adminCredential.uid);

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: `Failed to register: ${error?.message}` }, { status: 400 });
  }
}
