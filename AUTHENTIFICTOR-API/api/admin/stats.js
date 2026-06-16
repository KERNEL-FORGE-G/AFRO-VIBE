import { prisma } from '../lib/prisma.js';

export default async function handler(req, res) {
  // Simple protection: only allow GET and maybe check a secret or admin email
  // In a real app, you'd verify a JWT here
  
  try {
    const totalUsers = await prisma.user.count();
    const totalLogins = await prisma.loginLog.count();
    
    const googleSuccess = await prisma.loginLog.count({
      where: { provider: 'google', status: 'success' }
    });
    const googleFailure = await prisma.loginLog.count({
      where: { provider: 'google', status: 'failure' }
    });
    
    const githubSuccess = await prisma.loginLog.count({
      where: { provider: 'github', status: 'success' }
    });
    const githubFailure = await prisma.loginLog.count({
      where: { provider: 'github', status: 'failure' }
    });

    const totalSuccess = await prisma.loginLog.count({
      where: { status: 'success' }
    });
    const totalFailure = await prisma.loginLog.count({
      where: { status: 'failure' }
    });
    
    const recentLogins = await prisma.loginLog.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });

    const users = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    const loginsByApp = await prisma.loginLog.groupBy({
      by: ['appName'],
      _count: {
        id: true
      }
    });

    const loginsByProvider = await prisma.loginLog.groupBy({
      by: ['provider'],
      _count: {
        id: true
      }
    });

    res.status(200).json({
      totalUsers,
      totalLogins,
      googleSuccess,
      googleFailure,
      githubSuccess,
      githubFailure,
      totalSuccess,
      totalFailure,
      recentLogins,
      users,
      loginsByApp,
      loginsByProvider
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
