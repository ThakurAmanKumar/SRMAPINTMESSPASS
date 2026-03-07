import { NextRequest, NextResponse } from 'next/server';
import PassRequest from '@/models/PassRequest';
import Pass from '@/models/Pass';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-middleware';
import Admin from '@/models/Admin';
import { sendEmail } from '@/lib/mailer';
import { getPassApprovedEmailHTML, getPassApprovedEmailText, getPassRejectedEmailHTML, getPassRejectedEmailText } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { action: string; requestNumber: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(req);
    if (!authResult.valid || !authResult.payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify if user is admin
    await connectDB();
    const admin = await Admin.findOne({ email: authResult.payload.email });
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { action, requestNumber } = params;
    let rejectionReason = '';
    let authorizationText = '';
    
    // Parse JSON body
    try {
      const body = await req.json();
      if (action === 'reject') {
        rejectionReason = body.rejectionReason || '';
      } else if (action === 'approve') {
        authorizationText = body.authorizationText || 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.';
      }
    } catch (e) {
      // No body provided
      if (action === 'approve') {
        authorizationText = 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.';
      }
    }

    const passRequest = await PassRequest.findOne({ requestNumber });

    if (!passRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Generate Issue ID for the pass
      const latestPass = await Pass.find().sort({ createdAt: -1 }).limit(1);
      let issueNumber = 1;
      
      if (latestPass.length > 0) {
        const lastIssueId = latestPass[0].issueId;
        const lastNumber = parseInt(lastIssueId.replace('SRMAPIM', ''), 10);
        issueNumber = lastNumber + 1;
      }

      const issueId = `SRMAPIM${String(issueNumber).padStart(2, '0')}`;

      // Create a new Pass record
      const newPass = new Pass({
        issueId,
        fullName: passRequest.fullName,
        regNumber: passRequest.registrationNumber,
        photoUrl: passRequest.photoUrl,
        issuedDate: new Date(),
        status: 'approved',
        authorizationText: authorizationText,
      });

      await newPass.save();

      // Update pass request
      passRequest.status = 'approved';
      passRequest.approvedAt = new Date();
      passRequest.rejectionReason = undefined;
      passRequest.issueId = issueId;
      await passRequest.save();

      // Send approval email to student
      try {
        await sendEmail({
          to: passRequest.email,
          subject: '✓ Your International Mess Pass Has Been Approved!',
          html: getPassApprovedEmailHTML({
            studentName: passRequest.fullName,
            email: passRequest.email,
            requestNumber: passRequest.requestNumber,
            registrationNumber: passRequest.registrationNumber,
            issueId: issueId,
            issuedDate: newPass.issuedDate.toISOString(),
          }),
          text: getPassApprovedEmailText({
            studentName: passRequest.fullName,
            email: passRequest.email,
            requestNumber: passRequest.requestNumber,
            registrationNumber: passRequest.registrationNumber,
            issueId: issueId,
            issuedDate: newPass.issuedDate.toISOString(),
          }),
        });
        console.log('Approval email sent to:', passRequest.email);
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Request approved and pass generated successfully',
        request: passRequest,
        pass: newPass,
      });
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }
      
      passRequest.status = 'rejected';
      passRequest.rejectionReason = rejectionReason;
      passRequest.rejectedAt = new Date();
      await passRequest.save();

      // Send rejection email to student
      try {
        await sendEmail({
          to: passRequest.email,
          subject: 'International Mess Pass Request - Status Update',
          html: getPassRejectedEmailHTML({
            studentName: passRequest.fullName,
            email: passRequest.email,
            requestNumber: passRequest.requestNumber,
            registrationNumber: passRequest.registrationNumber,
            rejectionReason: rejectionReason,
          }),
          text: getPassRejectedEmailText({
            studentName: passRequest.fullName,
            email: passRequest.email,
            requestNumber: passRequest.requestNumber,
            registrationNumber: passRequest.registrationNumber,
            rejectionReason: rejectionReason,
          }),
        });
        console.log('Rejection email sent to:', passRequest.email);
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Request rejected and notification sent to student',
        request: passRequest,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating pass request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update pass request' },
      { status: 500 }
    );
  }
}
