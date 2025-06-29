import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  instructions: string;
  input?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client to verify the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { instructions, input }: RequestBody = await req.json()

    if (!instructions) {
      return new Response(
        JSON.stringify({ error: 'Instructions are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Create the prompt based on whether input is provided
    let systemPrompt: string
    let userPrompt: string

    if (input && input.trim()) {
      // Improve existing text
      systemPrompt = `You are a professional writing assistant. Your task is to improve the provided text based on the given instructions. Maintain the original intent and meaning while enhancing clarity, style, and effectiveness.`
      userPrompt = `Instructions: ${instructions}

Original text to improve:
${input}

Please provide the improved version:`
    } else {
      // Generate new text
      systemPrompt = `You are a professional writing assistant. Your task is to generate high-quality text based on the provided instructions. Create content that is clear, engaging, and appropriate for the context.`
      userPrompt = `Instructions: ${instructions}

Please generate the requested text:`
    }

    // Set up timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const generatedText = completion.choices[0]?.message?.content

      if (!generatedText) {
        return new Response(
          JSON.stringify({ error: 'No text was generated' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          text: generatedText.trim(),
          usage: completion.usage 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timed out. Please try again.' }),
          { 
            status: 408, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate text. Please try again.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})