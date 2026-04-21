// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// serve(async (req: Request): Promise<Response> => {
//   try {
//     const { user_id, type, store_name } = await req.json()

//     const supabase = createClient(
//       Deno.env.get('SUPABASE_URL')!,
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
//     )

//     // 🔥 fetch user email (safer method)
//     const { data, error } = await supabase.auth.admin.getUserById(user_id)

//     if (error) {
//       throw new Error(error.message)
//     }

//     const email = data?.user?.email

//     if (!email) {
//       throw new Error('User email not found')
//     }

//     let subject = ''
//     let message = ''

//     switch (type) {
//       case 'approved':
//         subject = 'Vendor Approved'
//         message = `Your store "${store_name}" has been approved.`
//         break

//       case 'rejected':
//         subject = 'Vendor Rejected'
//         message = `Your store "${store_name}" was rejected.`
//         break

//       case 'removed':
//         subject = 'Vendor Removed'
//         message = `Your store "${store_name}" has been removed.`
//         break

//       default:
//         return new Response(JSON.stringify({ error: 'Invalid type' }), {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         })
//     }

//     const res = await fetch('https://api.resend.com/emails', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         from: 'Your App <onboarding@resend.dev>',
//         to: email,
//         subject,
//         html: `<p>${message}</p>`,
//       }),
//     })

//     const result = await res.json()

//     return new Response(JSON.stringify({ success: true, result }), {
//       headers: { 'Content-Type': 'application/json' },
//     })
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : 'Unknown error'

//     return new Response(JSON.stringify({ error: message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     })
//   }
// })
