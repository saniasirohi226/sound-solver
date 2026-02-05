 import { useEffect, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Badge } from "@/components/ui/badge";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ArrowLeft, CheckSquare, Loader2, Trash2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { toast } from "sonner";
 
 interface Task {
   id: string;
   title: string;
   priority: string | null;
   is_completed: boolean;
   created_at: string;
   voice_note_id: string | null;
 }
 
 export default function Tasks() {
   const navigate = useNavigate();
   const { user, loading: authLoading } = useAuth();
   const [tasks, setTasks] = useState<Task[]>([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate("/login");
       return;
     }
 
     if (user) {
       fetchTasks();
     }
   }, [user, authLoading, navigate]);
 
   const fetchTasks = async () => {
     const { data, error } = await supabase
       .from("tasks")
       .select("*")
       .order("created_at", { ascending: false });
 
     if (error) {
       toast.error("Failed to load tasks");
       console.error(error);
     } else {
       setTasks(data || []);
     }
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
 
   const deleteTask = async (taskId: string) => {
     const { error } = await supabase.from("tasks").delete().eq("id", taskId);
 
     if (error) {
       toast.error("Failed to delete task");
       return;
     }
 
     setTasks(tasks.filter((t) => t.id !== taskId));
     toast.success("Task deleted");
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
 
   const filteredTasks = tasks.filter((task) => {
     if (filter === "active") return !task.is_completed;
     if (filter === "completed") return task.is_completed;
     return true;
   });
 
   const activeTasks = tasks.filter((t) => !t.is_completed).length;
   const completedTasks = tasks.filter((t) => t.is_completed).length;
 
   if (loading || authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b border-border">
         <div className="container mx-auto px-4 py-4 flex items-center">
           <Button variant="ghost" onClick={() => navigate("/dashboard")}>
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Dashboard
           </Button>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-8">
         <div className="max-w-3xl mx-auto">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                 <CheckSquare className="w-6 h-6 text-primary" />
                 All Tasks
               </h1>
               <p className="text-muted-foreground mt-1">
                 {activeTasks} active · {completedTasks} completed
               </p>
             </div>
           </div>
 
           <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
             <TabsList className="mb-4">
               <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
               <TabsTrigger value="active">Active ({activeTasks})</TabsTrigger>
               <TabsTrigger value="completed">Completed ({completedTasks})</TabsTrigger>
             </TabsList>
 
             <TabsContent value={filter}>
               {filteredTasks.length === 0 ? (
                 <Card>
                   <CardContent className="py-12 text-center">
                     <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                     <h3 className="text-lg font-semibold text-foreground mb-2">
                       {filter === "completed" ? "No completed tasks" : "No tasks yet"}
                     </h3>
                     <p className="text-muted-foreground">
                       {filter === "completed"
                         ? "Tasks you complete will appear here."
                         : "Record a voice note to extract tasks automatically."}
                     </p>
                   </CardContent>
                 </Card>
               ) : (
                 <Card>
                   <CardContent className="pt-6">
                     <ul className="space-y-3">
                       {filteredTasks.map((task) => (
                         <li
                           key={task.id}
                           className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                         >
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
                           <Button
                             variant="ghost"
                             size="icon"
                             className="text-muted-foreground hover:text-destructive"
                             onClick={() => deleteTask(task.id)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </li>
                       ))}
                     </ul>
                   </CardContent>
                 </Card>
               )}
             </TabsContent>
           </Tabs>
         </div>
       </main>
     </div>
   );
 }