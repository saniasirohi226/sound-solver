 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { transcript } = await req.json();
 
     if (!transcript) {
       throw new Error("No transcript provided");
     }
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const systemPrompt = `You are an assistant that extracts actionable information from voice note transcripts.
 
 Analyze the transcript and extract:
 1. A short, descriptive title (max 50 chars)
 2. A concise summary (2-3 sentences)
 3. Tasks/action items with priorities (low, medium, high)
 4. Calendar events with dates, times, and locations if mentioned
 
 For dates, interpret relative terms like "tomorrow", "next Monday", etc. based on today's date.
 Current date: ${new Date().toISOString().split("T")[0]}
 
 Return ONLY valid JSON in this exact format:
 {
   "title": "string",
   "summary": "string",
   "tasks": [{"title": "string", "priority": "low|medium|high"}],
   "events": [{"title": "string", "description": "string|null", "start_time": "ISO8601 datetime|null", "end_time": "ISO8601 datetime|null", "location": "string|null"}]
 }`;
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: `Extract information from this voice note transcript:\n\n${transcript}` },
         ],
         temperature: 0.3,
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(
           JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
           {
             status: 429,
             headers: { ...corsHeaders, "Content-Type": "application/json" },
           }
         );
       }
       if (response.status === 402) {
         return new Response(
           JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
           {
             status: 402,
             headers: { ...corsHeaders, "Content-Type": "application/json" },
           }
         );
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       throw new Error(`AI processing failed: ${response.status}`);
     }
 
     const aiResult = await response.json();
     const content = aiResult.choices?.[0]?.message?.content;
 
     if (!content) {
       throw new Error("No content in AI response");
     }
 
     // Parse JSON from response (handle markdown code blocks)
     let parsed;
     try {
       const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
       const jsonStr = jsonMatch ? jsonMatch[1] : content;
       parsed = JSON.parse(jsonStr.trim());
     } catch (parseError) {
       console.error("Failed to parse AI response:", content);
       // Return basic structure if parsing fails
       parsed = {
         title: "Voice Note",
         summary: transcript.slice(0, 200),
         tasks: [],
         events: [],
       };
     }
 
     return new Response(JSON.stringify(parsed), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Processing error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Processing failed" }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });