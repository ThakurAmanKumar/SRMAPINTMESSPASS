import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminHistory from '@/models/AdminHistory';
import PassRequest from '@/models/PassRequest';
import { verifySuperAdminAuth } from '@/lib/superadmin-middleware';
import { ObjectId } from 'mongodb';

export async function GET(
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Get the history record to extract deleted document details
    const history = await AdminHistory.findById(id);
    
    if (!history) {
      return NextResponse.json(
        { error: 'History record not found' },
        { status: 404 }
      );
    }

    let document: any = {};

    // Extract details from actionDetails string
    const detailsText = history.actionDetails || '';
    
    // Parse based on action type
    if (history.actionType === 'DELETE_PASS') {
      // Example format: "Deleted pass: PASS123: Student Name, Reg#12345"
      const passMatch = detailsText.match(/pass[:\s]*([#\w-]+)/i);
      const studentMatch = detailsText.match(/student[:\s]*([^,\[\]]*?)(?:,|$)/i) || detailsText.match(/(?:name|student)[:\s]*([^,\[\]]*?)(?:,|$)/i);
      let regMatch = detailsText.match(/(?:reg(?:istration)?|reg#)[:\s]*([#\w-]+)/i);
      const dateMatch = detailsText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g);

      let registrationNumber = regMatch ? regMatch[1].trim() : 'N/A';
      
      // Try to fetch from PassRequest by student name to get real registration number
      if (studentMatch) {
        try {
          const passRequest = await PassRequest.findOne({ 
            fullName: new RegExp(`^${studentMatch[1].trim()}$`, 'i') 
          }).lean();
          if (passRequest && passRequest.registrationNumber && passRequest.registrationNumber !== 'No') {
            registrationNumber = passRequest.registrationNumber;
          }
        } catch (err) {
          console.error('Error fetching pass request for registration number:', err);
        }
      }

      document = {
        type: 'Pass Document',
        passNumber: passMatch ? passMatch[1].trim() : 'N/A',
        studentName: studentMatch ? studentMatch[1].trim() : 'N/A',
        registrationNumber,
        messStartDate: dateMatch?.[0] || null,
        messEndDate: dateMatch?.[1] || null,
        deletedBy: history.adminEmail,
        deletedAt: history.createdAt,
        status: 'DELETED',
        fullDetails: detailsText,
      };
    } else if (history.actionType === 'DELETE_REQUEST') {
      const reqMatch = detailsText.match(/request[:\s]*([#\w-]+)/i);
      const studentMatch = detailsText.match(/student[:\s]*([^,\[\]]*?)(?:,|$)/i) || detailsText.match(/(?:name|student)[:\s]*([^,\[\]]*?)(?:,|$)/i);
      let regMatch = detailsText.match(/(?:reg(?:istration)?|reg#)[:\s]*([#\w-]+)/i);

      let registrationNumber = regMatch ? regMatch[1].trim() : 'N/A';
      
      // Try to fetch from PassRequest by request number to get real registration number
      if (reqMatch) {
        try {
          const passRequest = await PassRequest.findOne({ 
            requestNumber: reqMatch[1].trim() 
          }).lean();
          if (passRequest && passRequest.registrationNumber && passRequest.registrationNumber !== 'No') {
            registrationNumber = passRequest.registrationNumber;
          }
        } catch (err) {
          console.error('Error fetching pass request for registration number:', err);
        }
      }

      document = {
        type: 'Pass Request Document',
        requestNumber: reqMatch ? reqMatch[1].trim() : 'N/A',
        studentName: studentMatch ? studentMatch[1].trim() : 'N/A',
        registrationNumber,
        deletedBy: history.adminEmail,
        deletedAt: history.createdAt,
        status: 'DELETED',
        fullDetails: detailsText,
      };
    } else {
      document = {
        type: 'Document',
        information: detailsText,
        deletedBy: history.adminEmail,
        deletedAt: history.createdAt,
        actionType: history.actionType,
      };
    }

    return NextResponse.json(
      { document },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching deleted document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document details: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
