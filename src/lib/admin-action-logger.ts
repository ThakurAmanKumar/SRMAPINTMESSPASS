import connectDB from '@/lib/mongodb';
import AdminHistory, { IAdminHistory } from '@/models/AdminHistory';

export type ActionType = 'DELETE_PASS' | 'DELETE_REQUEST' | 'REVOKE_PASS' | 'APPROVE_REQUEST' | 'REJECT_REQUEST' | 'CREATE_ADMIN' | 'DELETE_ADMIN' | 'UPDATE_ADMIN' | 'OTHER';
export type TargetType = 'PASS' | 'REQUEST' | 'ADMIN' | 'OTHER';

interface LogActionParams {
  adminEmail: string;
  actionType: ActionType;
  actionDetails: string;
  targetId?: string;
  targetType?: TargetType;
  status?: 'SUCCESS' | 'FAILED';
  ipAddress?: string;
}

/**
 * Log admin action to AdminHistory collection
 */
export async function logAdminAction({
  adminEmail,
  actionType,
  actionDetails,
  targetId = null,
  targetType = 'OTHER',
  status = 'SUCCESS',
  ipAddress = null,
}: LogActionParams): Promise<IAdminHistory | null> {
  try {
    await connectDB();

    const history = await AdminHistory.create({
      adminEmail: adminEmail.toLowerCase(),
      actionType,
      actionDetails,
      targetId,
      targetType,
      status,
      ipAddress,
      createdAt: new Date(),
    });

    return history;
  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
}

/**
 * Get admin's action history
 */
export async function getAdminActionHistory(
  adminEmail: string,
  limit: number = 50,
  skip: number = 0
): Promise<IAdminHistory[]> {
  try {
    await connectDB();

    const history = await AdminHistory.find({ adminEmail: adminEmail.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return history;
  } catch (error) {
    console.error('Error fetching admin action history:', error);
    return [];
  }
}

/**
 * Get all system action history (for super admin)
 */
export async function getAllActionHistory(
  limit: number = 100,
  skip: number = 0,
  filters?: { adminEmail?: string; actionType?: ActionType }
): Promise<IAdminHistory[]> {
  try {
    await connectDB();

    const query: any = {};

    if (filters?.adminEmail) {
      query.adminEmail = filters.adminEmail.toLowerCase();
    }

    if (filters?.actionType) {
      query.actionType = filters.actionType;
    }

    const history = await AdminHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return history;
  } catch (error) {
    console.error('Error fetching all action history:', error);
    return [];
  }
}

/**
 * Get action history statistics
 */
export async function getActionHistoryStats(adminEmail?: string) {
  try {
    await connectDB();

    const query = adminEmail ? { adminEmail: adminEmail.toLowerCase() } : {};

    const [totalActions, actionsByType, recentActions] = await Promise.all([
      AdminHistory.countDocuments(query),
      AdminHistory.aggregate([
        { $match: query },
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AdminHistory.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      totalActions,
      actionsByType,
      recentActions,
    };
  } catch (error) {
    console.error('Error fetching action history stats:', error);
    return {
      totalActions: 0,
      actionsByType: [],
      recentActions: [],
    };
  }
}

/**
 * Get activity statistics (for dashboard)
 */
export async function getActivityStats() {
  try {
    await connectDB();

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, last24h, byType] = await Promise.all([
      AdminHistory.countDocuments({}),
      AdminHistory.countDocuments({ createdAt: { $gte: last24Hours } }),
      AdminHistory.aggregate([
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      total,
      last24h,
      byType,
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return {
      total: 0,
      last24h: 0,
      byType: [],
    };
  }
}
