import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Allow access to Bedrock routes without authentication
      if (nextUrl.pathname.startsWith('/bedrock') || 
          nextUrl.pathname.startsWith('/api/bedrock-chat')) {
        return true;
      }
      
      // Protect other routes
      const isOnDashboard = nextUrl.pathname.startsWith('/');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return true;
      }
      return true;
    },
  },
  providers: [], // configured in auth.ts
};
