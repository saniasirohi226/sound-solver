 import { useState, useCallback } from "react";
 import { Button } from "@/components/ui/button";
 import { Upload, File, Loader2, X } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { useNavigate } from "react-router-dom";
 
 interface FileUploaderProps {
   onComplete: () => void;
 }
 
 export default function FileUploader({ onComplete }: FileUploaderProps) {
   const [file, setFile] = useState<File | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);
   const [isDragging, setIsDragging] = useState(false);
   const navigate = useNavigate();
 
   const handleDrop = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
 
     const droppedFile = e.dataTransfer.files[0];
     if (droppedFile && isValidAudioFile(droppedFile)) {
       setFile(droppedFile);
     } else {
       toast.error("Please upload a valid audio file (MP3, WAV, M4A, WebM)");
     }
   }, []);
 
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFile = e.target.files?.[0];
     if (selectedFile && isValidAudioFile(selectedFile)) {
       setFile(selectedFile);
     } else {
       toast.error("Please upload a valid audio file (MP3, WAV, M4A, WebM)");
     }
   };
 
   const isValidAudioFile = (file: File) => {
     const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/webm"];
     return validTypes.includes(file.type) || file.name.match(/\.(mp3|wav|m4a|webm)$/i);
   };
 
   const processFile = async () => {
     if (!file) return;
 
     setIsProcessing(true);
 
     try {
       const base64Audio = await fileToBase64(file);
 
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
           title: processData.title || file.name.replace(/\.[^/.]+$/, ""),
           transcript,
           summary: processData.summary,
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
 
       toast.success("Audio file processed successfully!");
       navigate(`/note/${voiceNote.id}`);
       onComplete();
     } catch (error: any) {
       console.error("Processing error:", error);
       toast.error(error.message || "Failed to process audio file");
     } finally {
       setIsProcessing(false);
       setFile(null);
     }
   };
 
   const fileToBase64 = (file: File): Promise<string> => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onloadend = () => {
         const base64 = reader.result as string;
         resolve(base64.split(",")[1]);
       };
       reader.onerror = reject;
       reader.readAsDataURL(file);
     });
   };
 
   return (
     <div className="flex flex-col items-center gap-4">
       {isProcessing ? (
         <div className="flex flex-col items-center gap-4 py-8">
           <Loader2 className="w-12 h-12 animate-spin text-primary" />
           <p className="text-muted-foreground">Processing your audio file...</p>
         </div>
       ) : (
         <>
           <div
             className={`w-full border-2 border-dashed rounded-xl p-8 transition-colors ${
               isDragging
                 ? "border-primary bg-primary/5"
                 : "border-border hover:border-primary/50"
             }`}
             onDragOver={(e) => {
               e.preventDefault();
               setIsDragging(true);
             }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={handleDrop}
           >
             {file ? (
               <div className="flex items-center justify-center gap-3">
                 <File className="w-8 h-8 text-primary" />
                 <span className="text-foreground font-medium">{file.name}</span>
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={() => setFile(null)}
                 >
                   <X className="w-4 h-4" />
                 </Button>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-3">
                 <Upload className="w-10 h-10 text-muted-foreground" />
                 <p className="text-muted-foreground text-center">
                   Drag and drop an audio file here, or{" "}
                   <label className="text-primary cursor-pointer hover:underline">
                     browse
                     <input
                       type="file"
                       accept="audio/*"
                       className="hidden"
                       onChange={handleFileSelect}
                     />
                   </label>
                 </p>
                 <p className="text-xs text-muted-foreground">
                   Supports MP3, WAV, M4A, WebM
                 </p>
               </div>
             )}
           </div>
 
           {file && (
             <Button onClick={processFile} size="lg">
               Process Audio
             </Button>
           )}
         </>
       )}
     </div>
   );
 }