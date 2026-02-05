 import { useState } from "react";
 import { Link, useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Mic, Loader2 } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { toast } from "sonner";
 
 export default function Signup() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const { signUp } = useAuth();
   const navigate = useNavigate();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
 
     const { error } = await signUp(email, password);
 
     if (error) {
       toast.error(error.message);
       setLoading(false);
       return;
     }
 
     toast.success("Account created! Please check your email to verify.");
     navigate("/login");
   };
 
   return (
     <div className="min-h-screen bg-background flex items-center justify-center p-4">
       <Card className="w-full max-w-md">
         <CardHeader className="text-center">
           <Link to="/" className="flex items-center justify-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
               <Mic className="w-5 h-5 text-primary-foreground" />
             </div>
             <span className="text-xl font-bold">VoiceFlow</span>
           </Link>
           <CardTitle>Create an account</CardTitle>
           <CardDescription>Get started with VoiceFlow today</CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="you@example.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <Input
                 id="password"
                 type="password"
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 minLength={6}
                 required
               />
               <p className="text-xs text-muted-foreground">
                 Must be at least 6 characters
               </p>
             </div>
             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Creating account...
                 </>
               ) : (
                 "Create account"
               )}
             </Button>
           </form>
           <p className="text-center text-sm text-muted-foreground mt-4">
             Already have an account?{" "}
             <Link to="/login" className="text-primary hover:underline">
               Sign in
             </Link>
           </p>
         </CardContent>
       </Card>
     </div>
   );
 }