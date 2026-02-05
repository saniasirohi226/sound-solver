 import { useState, useRef } from "react";
 import { Button } from "@/components/ui/button";
 import { Mic, Square, Loader2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { useNavigate } from "react-router-dom";
 
 interface VoiceRecorderProps {
   onComplete: () => void;
 }
 
 export default function VoiceRecorder({ onComplete }: VoiceRecorderProps) {
   const [isRecording, setIsRecording] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [duration, setDuration] = useState(0);
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const chunksRef = useRef<Blob[]>([]);
   const timerRef = useRef<NodeJS.Timeout | null>(null);
   const navigate = useNavigate();
 
   const startRecording = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       const mediaRecorder = new MediaRecorder(stream);
       mediaRecorderRef.current = mediaRecorder;
       chunksRef.current = [];
 
       mediaRecorder.ondataavailable = (event) => {
         if (event.data.size > 0) {
           chunksRef.current.push(event.data);
         }
       };
 
       mediaRecorder.onstop = () => {
         stream.getTracks().forEach((track) => track.stop());
       };
 
       mediaRecorder.start();
       setIsRecording(true);
       setDuration(0);
 
       timerRef.current = setInterval(() => {
         setDuration((prev) => prev + 1);
       }, 1000);
     } catch (error) {
       toast.error("Could not access microphone. Please grant permission.");
     }
   };
 
   const stopRecording = async () => {
     if (!mediaRecorderRef.current) return;
 
     if (timerRef.current) {
       clearInterval(timerRef.current);
       timerRef.current = null;
     }
 
     setIsRecording(false);
     setIsProcessing(true);
 
     mediaRecorderRef.current.onstop = async () => {
       const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
       await processAudio(audioBlob);
     };
 
     mediaRecorderRef.current.stop();
   };
 
   const processAudio = async (audioBlob: Blob) => {
     try {
       // Convert to base64
       const base64Audio = await blobToBase64(audioBlob);
 
       // Call transcription edge function
       const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke(
         "transcribe-audio",
         {
           body: { audio: base64Audio },
         }
       );
 
       if (transcribeError) throw transcribeError;
 
       const transcript = transcribeData.text;
 
       // Call AI processing edge function
       const { data: processData, error: processError } = await supabase.functions.invoke(
         "process-transcript",
         {
           body: { transcript },
         }
       );
 
       if (processError) throw processError;
 
       // Save to database
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error("Not authenticated");
 
       const { data: voiceNote, error: saveError } = await supabase
         .from("voice_notes")
         .insert({
           user_id: user.id,
           title: processData.title || "Voice Note",
           transcript,
           summary: processData.summary,
           duration_seconds: duration,
         })
         .select()
         .single();
 
       if (saveError) throw saveError;
 
       // Save tasks
       if (processData.tasks?.length > 0) {
         const tasks = processData.tasks.map((task: any) => ({
           user_id: user.id,
           voice_note_id: voiceNote.id,
           title: task.title,
           priority: task.priority || "medium",
         }));
 
         await supabase.from("tasks").insert(tasks);
       }
 
       // Save events
       if (processData.events?.length > 0) {
         const events = processData.events.map((event: any) => ({
           user_id: user.id,
           voice_note_id: voiceNote.id,
           title: event.title,
           description: event.description,
           start_time: event.start_time,
           end_time: event.end_time,
           location: event.location,
         }));
 
         await supabase.from("calendar_events").insert(events);
       }
 
       toast.success("Voice note processed successfully!");
       navigate(`/note/${voiceNote.id}`);
       onComplete();
     } catch (error: any) {
       console.error("Processing error:", error);
       toast.error(error.message || "Failed to process audio");
     } finally {
       setIsProcessing(false);
       setDuration(0);
     }
   };
 
   const blobToBase64 = (blob: Blob): Promise<string> => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onloadend = () => {
         const base64 = reader.result as string;
         resolve(base64.split(",")[1]);
       };
       reader.onerror = reject;
       reader.readAsDataURL(blob);
     });
   };
 
   const formatDuration = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs.toString().padStart(2, "0")}`;
   };
 
   return (
     <div className="flex flex-col items-center gap-4">
       {isProcessing ? (
         <div className="flex flex-col items-center gap-4 py-8">
           <Loader2 className="w-12 h-12 animate-spin text-primary" />
           <p className="text-muted-foreground">Processing your voice note...</p>
         </div>
       ) : (
         <>
           <div
             className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
               isRecording
                 ? "bg-destructive animate-pulse"
                 : "bg-primary hover:bg-primary/90"
             }`}
           >
             {isRecording ? (
               <Square className="w-8 h-8 text-destructive-foreground" />
             ) : (
               <Mic className="w-10 h-10 text-primary-foreground" />
             )}
           </div>
 
           {isRecording && (
             <p className="text-2xl font-mono text-foreground">
               {formatDuration(duration)}
             </p>
           )}
 
           <Button
             size="lg"
             variant={isRecording ? "destructive" : "default"}
             onClick={isRecording ? stopRecording : startRecording}
           >
             {isRecording ? "Stop Recording" : "Start Recording"}
           </Button>
 
           <p className="text-sm text-muted-foreground">
             {isRecording
               ? "Tap to stop and process"
               : "Tap to start recording your voice note"}
           </p>
         </>
       )}
     </div>
   );
 }