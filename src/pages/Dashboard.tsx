 import { useEffect, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Mic, Upload, FileText, CheckSquare, Calendar, LogOut, Loader2 } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import VoiceRecorder from "@/components/VoiceRecorder";
 import FileUploader from "@/components/FileUploader";
 import VoiceNotesList from "@/components/VoiceNotesList";
 
 export default function Dashboard() {
   const { user, loading: authLoading, signOut } = useAuth();
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
   const [refreshKey, setRefreshKey] = useState(0);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate("/login");
     }
   }, [user, authLoading, navigate]);
 
   const handleSignOut = async () => {
     await signOut();
     navigate("/");
   };
 
   const handleProcessingComplete = () => {
     setRefreshKey((prev) => prev + 1);
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!user) return null;
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b border-border">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
               <Mic className="w-5 h-5 text-primary-foreground" />
             </div>
             <span className="text-xl font-bold text-foreground">VoiceFlow</span>
           </div>
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
               <CheckSquare className="w-4 h-4 mr-2" />
               Tasks
             </Button>
             <Button variant="ghost" size="sm" onClick={handleSignOut}>
               <LogOut className="w-4 h-4 mr-2" />
               Sign out
             </Button>
           </div>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-8">
         <div className="max-w-4xl mx-auto">
           {/* Voice Input Section */}
           <Card className="mb-8">
             <CardHeader>
               <CardTitle>New Voice Note</CardTitle>
               <CardDescription>
                 Record or upload audio to extract tasks, summaries, and events
               </CardDescription>
             </CardHeader>
             <CardContent>
               {/* Tab Buttons */}
               <div className="flex gap-2 mb-6">
                 <Button
                   variant={activeTab === "record" ? "default" : "secondary"}
                   onClick={() => setActiveTab("record")}
                   className="flex-1"
                 >
                   <Mic className="w-4 h-4 mr-2" />
                   Record
                 </Button>
                 <Button
                   variant={activeTab === "upload" ? "default" : "secondary"}
                   onClick={() => setActiveTab("upload")}
                   className="flex-1"
                 >
                   <Upload className="w-4 h-4 mr-2" />
                   Upload
                 </Button>
               </div>
 
               {/* Content */}
               {activeTab === "record" ? (
                 <VoiceRecorder onComplete={handleProcessingComplete} />
               ) : (
                 <FileUploader onComplete={handleProcessingComplete} />
               )}
             </CardContent>
           </Card>
 
           {/* Recent Voice Notes */}
           <VoiceNotesList key={refreshKey} />
         </div>
       </main>
     </div>
   );
 }