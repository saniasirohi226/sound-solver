 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Mic, FileText, Calendar, CheckSquare, ArrowRight } from "lucide-react";
 
 export default function Landing() {
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
           <div className="flex items-center gap-3">
             <Link to="/login">
               <Button variant="ghost">Log in</Button>
             </Link>
             <Link to="/signup">
               <Button>Get Started</Button>
             </Link>
           </div>
         </div>
       </header>
 
       {/* Hero Section */}
       <section className="container mx-auto px-4 py-20 text-center">
         <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
           Transform Your Voice Into
           <span className="text-primary"> Actionable Tasks</span>
         </h1>
         <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
           Record or upload voice notes and let AI extract tasks, summaries, and calendar events automatically. Stay productive without typing.
         </p>
         <Link to="/signup">
           <Button size="lg" className="gap-2">
             Start Free <ArrowRight className="w-4 h-4" />
           </Button>
         </Link>
       </section>
 
       {/* Features Section */}
       <section className="container mx-auto px-4 py-16">
         <h2 className="text-3xl font-bold text-foreground text-center mb-12">
           How It Works
         </h2>
         <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
           <FeatureCard
             icon={<Mic className="w-6 h-6" />}
             title="Record or Upload"
             description="Use your microphone to record live or upload existing audio files. Supports MP3, WAV, M4A and more."
           />
           <FeatureCard
             icon={<FileText className="w-6 h-6" />}
             title="AI Transcription"
             description="Your audio is instantly transcribed with high accuracy, then analyzed to extract key information."
           />
           <FeatureCard
             icon={<CheckSquare className="w-6 h-6" />}
             title="Get Organized"
             description="Receive a summary, actionable tasks, and calendar events - all extracted from your voice note."
           />
         </div>
       </section>
 
       {/* Benefits Section */}
       <section className="container mx-auto px-4 py-16 border-t border-border">
         <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
           <div>
             <h2 className="text-3xl font-bold text-foreground mb-6">
               Everything You Need
             </h2>
             <ul className="space-y-4">
               <BenefitItem text="Extract tasks with priorities automatically" />
               <BenefitItem text="Get concise summaries of your notes" />
               <BenefitItem text="Detect dates and create calendar events" />
               <BenefitItem text="Export events to any calendar app" />
               <BenefitItem text="Manage all tasks in one place" />
             </ul>
           </div>
           <div className="bg-card rounded-2xl border border-border p-8">
             <div className="flex items-center gap-3 mb-4">
               <Calendar className="w-5 h-5 text-primary" />
               <span className="text-sm text-muted-foreground">Calendar Export</span>
             </div>
             <p className="text-foreground mb-4">
               "Meeting with design team tomorrow at 2pm to review mockups"
             </p>
             <div className="bg-secondary rounded-lg p-4">
               <p className="text-sm font-medium text-foreground">Design Team Review</p>
               <p className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</p>
             </div>
           </div>
         </div>
       </section>
 
       {/* CTA Section */}
       <section className="container mx-auto px-4 py-20 text-center">
         <div className="bg-card border border-border rounded-2xl p-12 max-w-3xl mx-auto">
           <h2 className="text-3xl font-bold text-foreground mb-4">
             Ready to Get Started?
           </h2>
           <p className="text-muted-foreground mb-8">
             Turn your voice notes into productivity in seconds.
           </p>
           <Link to="/signup">
             <Button size="lg">Create Free Account</Button>
           </Link>
         </div>
       </section>
 
       {/* Footer */}
       <footer className="border-t border-border py-8">
         <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
           © 2025 VoiceFlow. All rights reserved.
         </div>
       </footer>
     </div>
   );
 }
 
 function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
   return (
     <div className="bg-card border border-border rounded-xl p-6 text-center">
       <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
         {icon}
       </div>
       <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
       <p className="text-muted-foreground text-sm">{description}</p>
     </div>
   );
 }
 
 function BenefitItem({ text }: { text: string }) {
   return (
     <li className="flex items-center gap-3">
       <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
         <CheckSquare className="w-3 h-3 text-primary" />
       </div>
       <span className="text-foreground">{text}</span>
     </li>
   );
 }