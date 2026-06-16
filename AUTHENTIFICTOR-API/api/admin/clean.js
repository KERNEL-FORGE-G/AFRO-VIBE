import { prisma } from '../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    console.log("Cleaning database logs and users...");
    
    // In database order (due to foreign key constraint, LoginLog must be deleted first)
    await prisma.loginLog.deleteMany();
    await prisma.user.deleteMany();

    return res.status(200).json({
      success: true,
      message: 'All connection logs and users have been deleted successfully from Neon database.'
    });
  } catch (error) {
    console.error('Clean Database Error:', error);
    return res.status(550).json({ error: 'Failed to clear the database' });
  }
}
