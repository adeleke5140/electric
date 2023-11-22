// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.1/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function errorResponse(msg: string) {
  return new Response(JSON.stringify({ msg }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function asyncTimeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (request: Request) => {
  let id: string | undefined;
  if (request.method == "POST") {
    const body = await request.text();
    const data = JSON.parse(body);
    id = data.id;
    if (!id) {
      return errorResponse('missing id in request')
    }
  } else {
    return errorResponse('invalid request method')
  }

  const authHeader = request.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data, error } = await supabaseClient
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return errorResponse(error.message)
  }

  // if (data.status !== 'submitted') {
  //   return errorResponse('item is not in submitted state')
  // }

  // Update the item status to 'processing'
  const { data: result, error: updateError } = await supabaseClient
    .from('items')
    .update({ status: 'processing' })
    .eq('id', id)
    .single()
  
  await asyncTimeout(2500)

  // Update the item status to 'processed'
  const { data: result2, error: updateError2 } = await supabaseClient
    .from('items')
    .update({ status: 'complete' })
    .eq('id', id)
    .single()

  return new Response(
    JSON.stringify({ msg: 'ok' }),
    { headers: { "Content-Type": "application/json" } },
  )
})
