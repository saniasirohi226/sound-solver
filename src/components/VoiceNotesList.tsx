 import { useEffect, useState } from "react";
 import { Link } from "react-router-dom";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { FileText, Calendar, CheckSquare, Loader2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { format } from "date-fns";
 
 interface VoiceNote {
   id: string;
   title: string | null;
   summary: string | null;
   created_at: string;
   duration_seconds: number | null;
 }
 
 export default function VoiceNotesList() {
   const [notes, setNotes] = useState<VoiceNote[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     fetchNotes();
   }, []);
 
   const fetchNotes = async () => {
     const { data, error } = await supabase
       .from("voice_notes")
       .select("id, title, summary, created_at, duration_seconds")
       .order("created_at", { ascending: false })
       .limit(10);
 
     if (error) {
       console.error("Error fetching notes:", error);
     } else {
       setNotes(data || []);
     }
     setLoading(false);
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (notes.length === 0) {
     return (
       <Card>
         <CardContent className="py-12 text-center">
           <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-foreground mb-2">No voice notes yet</h3>
           <p className="text-muted-foreground">
             Record or upload your first voice note to get started.
           </p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <div className="space-y-4">
       <h2 className="text-xl font-semibold text-foreground">Recent Voice Notes</h2>
       <div className="grid gap-4">
         {notes.map((note) => (
           <Link key={note.id} to={`/note/${note.id}`}>
             <Card className="hover:border-primary/50 transition-colors cursor-pointer">
               <CardHeader className="pb-2">
                 <div className="flex items-start justify-between">
                   <CardTitle className="text-lg">{note.title || "Untitled Note"}</CardTitle>
                   <span className="text-xs text-muted-foreground">
                     {format(new Date(note.created_at), "MMM d, yyyy")}
                   </span>
                 </div>
               </CardHeader>
               <CardContent>
                 {note.summary && (
                   <p className="text-sm text-muted-foreground line-clamp-2">
                     {note.summary}
                   </p>
                 )}
               </CardContent>
             </Card>
           </Link>
         ))}
       </div>
     </div>
   );
 }