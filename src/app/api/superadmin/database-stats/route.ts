import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifySuperAdminAuth } from '@/lib/superadmin-middleware';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    const connection = await dbConnect();

    // Get database stats
    const dbStats = await connection.connection.db.stats();
    
    // Get storage info from database
    const dataSize = dbStats.dataSize || 0; // Actual data size in bytes
    const storageSize = dbStats.storageSize || dataSize; // Storage allocated (includes overhead)
    const indexSize = dbStats.indexSize || 0; // Index size
    
    // Calculate totals
    const usedSize = storageSize + indexSize; // Total used including indexes
    
    // For MongoDB Atlas, estimate total as 10x used size (typical cloud allocation)
    // or get from environment variable if available
    const totalAllocated = parseInt(process.env.MONGODB_ALLOCATED_STORAGE || '0') * 1024 * 1024 * 1024 || usedSize * 10;
    const availableSize = totalAllocated - usedSize;

    // Convert to MB and GB for display
    const usedMB = usedSize / (1024 * 1024);
    const availableMB = availableSize / (1024 * 1024);
    const totalMB = totalAllocated / (1024 * 1024);

    const usedGB = usedMB / 1024;
    const availableGB = availableMB / 1024;
    const totalGB = totalMB / 1024;

    // Calculate percentage used
    const percentageUsed = totalAllocated > 0 ? (usedSize / totalAllocated) * 100 : 0;

    return NextResponse.json(
      {
        storage: {
          used: {
            bytes: usedSize,
            mb: Math.round(usedMB * 100) / 100,
            gb: parseFloat(usedGB.toFixed(2)),
          },
          available: {
            bytes: availableSize,
            mb: Math.round(availableMB * 100) / 100,
            gb: parseFloat(availableGB.toFixed(2)),
          },
          total: {
            bytes: totalAllocated,
            mb: Math.round(totalMB * 100) / 100,
            gb: parseFloat(totalGB.toFixed(2)),
          },
          percentageUsed: parseFloat(Math.round(percentageUsed * 100) / 100),
          percentageAvailable: parseFloat(Math.round((100 - percentageUsed) * 100) / 100),
        },
        database: {
          dataSize: {
            bytes: dataSize,
            mb: Math.round((dataSize / (1024 * 1024)) * 100) / 100,
            gb: parseFloat((dataSize / (1024 * 1024 * 1024)).toFixed(2)),
          },
          collections: dbStats.collections || 0,
          indexes: dbStats.indexes || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database statistics' },
      { status: 500 }
    );
  }
}
