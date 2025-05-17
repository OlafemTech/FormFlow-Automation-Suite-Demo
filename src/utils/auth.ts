import { NextApiRequest, NextApiResponse } from 'next';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

// In a real application, users would be stored in a database
// This is a simple in-memory implementation for demonstration purposes
const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    // Password: admin123
    password: '$2a$10$GQH.xZm5dLBGZ1IyZTCeUu3Kp.Nt9aQZCTKy.jVJv0G3XWCB2Vkwu',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Staff User',
    email: 'staff@example.com',
    role: 'staff',
    // Password: staff123
    password: '$2a$10$vQcjA.FZxQB5vu48IIMB8.6OUOLanWU1MJRfFHyDh.44EFhAaJk6.',
    createdAt: new Date()
  }
] as (User & { password: string })[];

// JWT secret (should be in environment variables in a real app)
const JWT_SECRET = 'your-jwt-secret-key';

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const user = users.find(user => user.email === credentials.email);
        
        if (!user) {
          return null;
        }
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isPasswordValid) {
          return null;
        }
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'staff';
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: JWT_SECRET,
};

/**
 * Middleware to check if the user is authenticated
 */
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const token = authHeader.substring(7);
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      // Find user
      const user = users.find(u => u.id === decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      // Call handler with authenticated user
      return handler(req, res, userWithoutPassword);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

/**
 * Middleware to check if the user has admin role
 */
export function withAdminAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>
) {
  return withAuth(async (req, res, user) => {
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return handler(req, res, user);
  });
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}
