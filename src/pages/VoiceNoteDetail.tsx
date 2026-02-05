 import { useEffect, useState } from "react";
 import { useParams, useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Badge } from "@/components/ui/badge";
 import { ArrowLeft, FileText, CheckSquare, Calendar, Download, Trash2, Loader2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { toast } from "sonner";
 import { format } from "date-fns";
 
 interface VoiceNote {
   id: string;
   title: string | null;
   transcript: string | null;
   summary: string | null;
   created_at: string;
   duration_seconds: number | null;
 }
 
 interface Task {
   id: string;
   title: string;
   priority: string | null;
   is_completed: boolean;
 }
 
 interface CalendarEvent {
   id: string;
   title: string;
   description: string | null;
   start_time: string | null;
   end_time: string | null;
   location: string | null;
 }
 
 export default function VoiceNoteDetail() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { user, loading: authLoading } = useAuth();
   const [note, setNote] = useState<VoiceNote | null>(null);
   const [tasks, setTasks] = useState<Task[]>([]);
   const [events, setEvents] = useState<CalendarEvent[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate("/login");
       return;
     }
 
     if (user && id) {
       fetchNoteData();
     }
   }, [user, authLoading, id, navigate]);
 
   const fetchNoteData = async () => {
     const [noteResult, tasksResult, eventsResult] = await Promise.all([
       supabase.from("voice_notes").select("*").eq("id", id).single(),
       supabase.from("tasks").select("*").eq("voice_note_id", id),
       supabase.from("calendar_events").select("*").eq("voice_note_id", id),
     ]);
 
     if (noteResult.error) {
       toast.error("Note not found");
       navigate("/dashboard");
       return;
     }
 
     setNote(noteResult.data);
     setTasks(tasksResult.data || []);
     setEvents(eventsResult.data || []);
     setLoading(false);
   };
 
   const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
     const { error } = await supabase
       .from("tasks")
       .update({ is_completed: !isCompleted })
       .eq("id", taskId);
 
     if (error) {
       toast.error("Failed to update task");
       return;
     }
 
     setTasks(tasks.map((t) => (t.id === taskId ? { ...t, is_completed: !isCompleted } : t)));
   };
 
   const deleteNote = async () => {
     if (!confirm("Are you sure you want to delete this note?")) return;
 
     const { error } = await supabase.from("voice_notes").delete().eq("id", id);
 
     if (error) {
       toast.error("Failed to delete note");
       return;
     }
 
     toast.success("Note deleted");
     navigate("/dashboard");
   };
 
   const exportEvent = (event: CalendarEvent) => {
     const icsContent = generateICS(event);
     const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = `${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
     link.click();
     URL.revokeObjectURL(url);
     toast.success("Event exported!");
   };
 
   const generateICS = (event: CalendarEvent) => {
     const formatDate = (date: string | null) => {
       if (!date) return format(new Date(), "yyyyMMdd'T'HHmmss");
       return format(new Date(date), "yyyyMMdd'T'HHmmss");
     };
 
     return `BEGIN:VCALENDAR
 VERSION:2.0
 PRODID:-//VoiceFlow//EN
 BEGIN:VEVENT
 UID:${event.id}@voiceflow.app
 DTSTAMP:${formatDate(new Date().toISOString())}
 DTSTART:${formatDate(event.start_time)}
 DTEND:${formatDate(event.end_time || event.start_time)}
 SUMMARY:${event.title}
 DESCRIPTION:${event.description || ""}
 LOCATION:${event.location || ""}
 END:VEVENT
 END:VCALENDAR`;
   };
 
   const getPriorityColor = (priority: string | null) => {
     switch (priority) {
       case "high":
         return "destructive";
       case "medium":
         return "default";
       case "low":
         return "secondary";
       default:
         return "secondary";
     }
   };
 
   if (loading || authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!note) return null;
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b border-border">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <Button variant="ghost" onClick={() => navigate("/dashboard")}>
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Dashboard
           </Button>
           <Button variant="destructive" size="sm" onClick={deleteNote}>
             <Trash2 className="w-4 h-4 mr-2" />
             Delete
           </Button>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-8">
         <div className="max-w-4xl mx-auto space-y-6">
           {/* Title & Date */}
           <div>
             <h1 className="text-2xl font-bold text-foreground mb-2">
               {note.title || "Untitled Note"}
             </h1>
             <p className="text-sm text-muted-foreground">
               {format(new Date(note.created_at), "MMMM d, yyyy 'at' h:mm a")}
               {note.duration_seconds && ` · ${Math.floor(note.duration_seconds / 60)}:${(note.duration_seconds % 60).toString().padStart(2, "0")}`}
             </p>
           </div>
 
           {/* Summary */}
           {note.summary && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <FileText className="w-5 h-5 text-primary" />
                   Summary
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-foreground">{note.summary}</p>
               </CardContent>
             </Card>
           )}
 
           {/* Tasks */}
           {tasks.length > 0 && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <CheckSquare className="w-5 h-5 text-primary" />
                   Tasks ({tasks.filter((t) => t.is_completed).length}/{tasks.length})
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ul className="space-y-3">
                   {tasks.map((task) => (
                     <li key={task.id} className="flex items-center gap-3">
                       <Checkbox
                         checked={task.is_completed}
                         onCheckedChange={() => toggleTaskComplete(task.id, task.is_completed)}
                       />
                       <span
                         className={`flex-1 ${
                           task.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                         }`}
                       >
                         {task.title}
                       </span>
                       <Badge variant={getPriorityColor(task.priority) as any}>
                         {task.priority || "medium"}
                       </Badge>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
           )}
 
           {/* Calendar Events */}
           {events.length > 0 && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-primary" />
                   Calendar Events
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ul className="space-y-4">
                   {events.map((event) => (
                     <li key={event.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                       <div>
                         <p className="font-medium text-foreground">{event.title}</p>
                         {event.description && (
                           <p className="text-sm text-muted-foreground">{event.description}</p>
                         )}
                         {event.start_time && (
                           <p className="text-sm text-primary mt-1">
                             {format(new Date(event.start_time), "MMMM d, yyyy 'at' h:mm a")}
                           </p>
                         )}
                         {event.location && (
                           <p className="text-xs text-muted-foreground mt-1">📍 {event.location}</p>
                         )}
                       </div>
                       <Button variant="outline" size="sm" onClick={() => exportEvent(event)}>
                         <Download className="w-4 h-4 mr-2" />
                         Export
                       </Button>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
           )}
 
           {/* Transcript */}
           {note.transcript && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-lg">Full Transcript</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-foreground whitespace-pre-wrap">{note.transcript}</p>
               </CardContent>
             </Card>
           )}
         </div>
       </main>
     </div>
   );
 }