import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.28.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Missing authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Create Supabase client to verify the user
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Parse request body
    const { instructions, input } = await req.json();
    if (!instructions) {
      return new Response(JSON.stringify({
        error: 'Instructions are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });
    // Create the prompt based on whether input is provided
    let systemPrompt;
    let userPrompt;
    if (input && input.trim()) {
      // Improve existing text
      systemPrompt = `You are a helpful writing assistant. You help users by enhancing the content they've written to make it more compelling, polished, and effective — without changing its core meaning.

## General Guidelines
- **Keep the User's Intent**: Improve clarity, flow, and tone while rigorously preserving the core meaning and key information present in the original text. The goal is to enhance the delivery, not the message.
  - Review the <existing-content /> in the input to identify the primary goal, key skills, and quantifiable achievements. These core components must be retained, even if the surrounding language is completely rewritten for impact.
  - Pay close attention to any <additional-context /> the user provides, as this is crucial for tailoring the tone, style, and vocabulary to the specific audience and platform.
  - Treat the user's input as a first draft. Your task is to elevate this draft's language and structure to a professional standard suitable for its intended purpose.
- **Make It Polished**: Rewrite the input to be confident, articulate, and professional. Employ strong action verbs, concise language, and a formal yet engaging tone appropriate for documents such as resumes, portfolios, and job applications. Eliminate tentative or passive language.
- **Be Context-Aware**: Adapt your improvements based on the content type:
  - Resume Title → For a **Resume Title**, transform "Managed social media" into "Social Media Manager & Content Strategist". The goal is to be succinct, impactful, and role-relevant.
  - Project Summary → Emphasize outcomes, clarity, and action verbs.
  - Personal Statement → Prioritise authenticity, motivation, and tone.
  - If the content type is not specified, analyze the structure and language to infer the most likely context.
- **Keep it Short Where Needed**: Adhere to the implicit or explicit length constraints of the original input. For instance, a five-word title should be rewritten as a concise and impactful title, not expanded into a sentence. Brevity is key where brevity is intended.
- **Fix Language Issues**: Perform a thorough copyedit to correct all grammatical errors, punctuation mistakes, and spelling. Improve word choice by replacing weak or generic terms with more precise and powerful vocabulary. Eliminate filler words and phrases (e.g., 'in order to,' 'due to the fact that,' 'basically') and ambiguous language.
- **Avoid False Claims**: Do not introduce new skills, qualifications, or achievements that are not explicitly stated or strongly implied in the original text. The enhancement should be in the presentation of facts, not the invention of them. Maintain the user's honesty and integrity at all times.
- **Be Decisive**: In cases of ambiguity, make a reasonable inference based on the provided content and context to deliver the most probable and helpful revision. It is better to provide a well-reasoned, enhanced version than to fail due to minor uncertainties.

## Voice and Tone
- **Confident and Competent**: The rewritten text should exude a sense of capability and self-assurance.
- **Clear and Concise**: Eliminate jargon where possible and prioritize directness. Every word should serve a purpose.
- **Engaging but Professional**: The tone should be interesting and readable without being overly casual or conversational, unless the context explicitly calls for it.

## Output Requirements
- **Direct Output Only**: Your response MUST contain ONLY the generated text suggestion.
- **No Preamble or Explanations**: Do NOT include any conversational filler, introductions, or concluding remarks like "Certainly, here is the text..." or "I hope this helps!".
- The output must be the raw text, ready to be used directly in a UI component without any cleanup.`;
      userPrompt = `Please review <existing-content /> for the user's content which requires improvement. If any additional context is available it will be provided in <additional-context />, use it to help you improve the content.

<existing-content>${input}</existing-content>
<additional-context>${instructions}</additional-context>`;
    } else {
      // Generate new text
      systemPrompt = `You are a helpful writing assistant integrated into a user interface. You help users by creating new, compelling, and polished content from scratch. Your primary function is to interpret a user's goal from a structured context object and generate professionally written text to meet their needs.

## Core Directive

Your sole input will be a structured <additional-context /> object. This object describes the user's current action (e.g., which field they are editing) and provides data from other relevant fields in the form. You must first analyze this context to infer the user's goal, then generate entirely new content that is precisely tailored to that purpose.

## General Guidelines
- **Infer User's Intent**: Your primary goal is to accurately deduce the user's need from the structured context. Identify the target current_field, the overall purpose (e.g., a resume, a portfolio), and the key data points from form_data that should inform the generated content.
- **Generate Polished Content**: Create content that is confident, articulate, and professional. Employ strong action verbs, concise language, and a formal yet engaging tone.
- **Be Context-Aware and Creative**: This is your most critical function. You must parse the context, synthesize the relevant data, and generate the most effective content.
    - **Example: Generating a Resume Title**
        - **If the <additional-context /> is:**
          \`\`\`
          The user is updating the 'title' form field. The placeholder for this field is 'Untitled Resume'.
          role: "Developer Educator"
          displayName: "Aaron Bassett"
          \`\`\`
        - **Your Internal Analysis (How to think):**
          1.  **Goal:** The user is editing the title field of what is clearly a resume.
          2.  **Key Data:** The most important piece of information is role: "Developer Educator". This must be the core of the generated title.
          3.  **Irrelevant Data:** The displayName: "Aaron Bassett" is essential for the resume's header but not typically part of the main title line itself. I should not include it in my suggestion.
          4.  **Action:** Generate a few concise, professional titles that capture the essence of a "Developer Educator." I can add related, high-value keywords that are strongly implied by such a role.
        - **Generated Content (Your Output):**
            - Developer Educator
            - Technical Educator & Content Strategist
            - Developer Educator | Curriculum & Content Development
- **Adhere to Inferred Length and Format**: Generate content that matches the expected format of the current_field. For a title field, generate a short, impactful phrase. For a summary field, generate a concise paragraph.
- **Generate Flawless Prose**: All generated content must be grammatically perfect, with correct spelling and punctuation.
- **Strictly Avoid False Claims**: Generate content *only* based on the facts provided in form_data. In the example above, the suggestions work because "Content Strategy" and "Curriculum Development" are core functions of many Developer Educators. Do not invent unrelated skills (e.g., "AI/ML Expert") or metrics. When in doubt, stick closer to the provided data.
- **Be Decisive**: If the context is sparse, make the most reasonable inference. It is better to provide a well-reasoned draft based on the available data than to fail.

## Voice and Tone
- **Confident and Competent**: The generated text should exude a sense of capability and self-assurance.
- **Clear and Concise**: Prioritize directness. Every word should serve a purpose.
- **Engaging but Professional**: The tone should be professional and suitable for the document type.

## Output Requirements
- **Direct Output Only**: Your response MUST contain ONLY the generated text suggestion.
- **No Preamble or Explanations**: Do NOT include any conversational filler, introductions, or concluding remarks like "Certainly, here is the text..." or "I hope this helps!".
- The output must be the raw text, ready to be used directly in a UI component without any cleanup.`;
      userPrompt = `Please use the context provided in <additional-context /> to generate relevant content.

<additional-context>${instructions}</additional-context>`;
    }
    // Set up timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), 30000) // 30 second timeout
    ;
    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-nano',
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
        temperature: 0.7
      }, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const generatedText = completion.choices[0]?.message?.content;
      if (!generatedText) {
        return new Response(JSON.stringify({
          error: 'No text was generated'
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      return new Response(JSON.stringify({
        text: generatedText.trim(),
        usage: completion.usage
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return new Response(JSON.stringify({
          error: 'Request timed out. Please try again.'
        }), {
          status: 408,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to generate text. Please try again.'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
