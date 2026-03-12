import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SuperAdmin from '@/models/SuperAdmin';
import { verifySuperAdminAuth, getClientIP } from '@/lib/superadmin-middleware';
import { logAdminAction } from '@/lib/admin-action-logger';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    await dbConnect();

    const { id } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid super admin ID' },
        { status: 400 }
      );
    }

    // Check if super admin exists
    const superAdmin = await SuperAdmin.findById(id);
    if (!superAdmin) {
      return NextResponse.json(
        { error: 'Super admin not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the current super admin (optional security measure)
    if (superAdmin.email === auth.payload!.email) {
      return NextResponse.json(
        { error: 'Cannot delete your own super admin account' },
        { status: 403 }
      );
    }

    // Delete super admin
    await SuperAdmin.findByIdAndDelete(id);

    // Log action
    await logAdminAction({
      adminEmail: auth.payload!.email,
      actionType: 'DELETE_ADMIN',
      actionDetails: `Deleted super admin: ${superAdmin.email}`,
      targetId: id,
      targetType: 'ADMIN',
      status: 'SUCCESS',
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(
      { message: 'Super admin deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting super admin:', error);

    // Log failed action
    try {
      const authRetry = await verifySuperAdminAuth(request);
      if (authRetry.valid && authRetry.payload) {
        await logAdminAction({
          adminEmail: authRetry.payload.email,
          actionType: 'DELETE_ADMIN',
          actionDetails: `Failed to delete super admin`,
          targetId: params.id,
          targetType: 'ADMIN',
          status: 'FAILED',
          ipAddress: getClientIP(request),
        });
      }
    } catch {}

    return NextResponse.json(
      { error: 'Failed to delete super admin' },
      { status: 500 }
    );
  }
}
