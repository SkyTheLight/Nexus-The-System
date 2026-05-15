import NextAuth from 'next-auth'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const handler = NextAuth({
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.access_token) return true

      const supabase = getSupabase()
      if (!supabase) return true

      try {
        const { error } = await supabase
          .from('users')
          .upsert({
            email: user.email,
            google_access_token: account.access_token,
            google_refresh_token: account.refresh_token,
            google_token_expiry: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email'
          })

        if (error) console.error('Failed to save tokens:', error)
      } catch (e) {
        console.error('Failed to save tokens:', e)
      }

      return true
    },
  },
})

export { handler as GET, handler as POST }
