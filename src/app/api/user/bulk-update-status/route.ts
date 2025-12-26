import { Collection } from '@/lib/core/models';
import { FirestoreAdminHelper } from '@/lib/firebase/server/firestore-admin.helper';
import { BulkUpdateStatusRequest } from '@/services/models/requests/user';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body: BulkUpdateStatusRequest = await request.json();

  const { status, userIds } = body;

  try {
    // Validate the request body
    if (!status || !userIds) {
      return NextResponse.json({ message: 'Payload not valid' }, { status: 400 });
    }

    await FirestoreAdminHelper.updateMany(
      Collection.USERS,
      userIds.map((id) => ({ field: 'id', op: '==', value: id })),
      { status, shouldRefreshToken: true }
    );

    return NextResponse.json({ message: 'Update successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: `Failed to update: ${error?.message}` }, { status: 400 });
  }
}
