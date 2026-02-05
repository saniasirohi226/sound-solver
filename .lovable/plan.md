
# VoiceFlow - Voice-to-Productivity App

## Overview
A dark-themed productivity web app that converts voice recordings into actionable tasks, summaries, and calendar events. Users can sign in to save their processed notes and export events to any calendar.

---

## Core Features

### 1. Authentication
- Email/password sign up and login
- Protected dashboard for authenticated users
- User profile with basic settings

### 2. Voice Input
- **Live Recording**: One-click microphone button to start/stop recording
- **File Upload**: Drag-and-drop zone for audio files (MP3, WAV, M4A, etc.)
- Visual feedback during recording (waveform/timer)

### 3. AI Processing
- **Speech-to-Text**: Convert audio to text using ElevenLabs STT
- **Smart Extraction**: AI analyzes the transcript to identify:
  - **Tasks**: Action items with optional priorities
  - **Summary**: Condensed version of the voice note
  - **Calendar Events**: Dates, times, and event details mentioned

### 4. Results Dashboard
- View all processed voice notes in a clean list
- Each note shows the original transcript + extracted items
- Filter by date, type (tasks/events)

### 5. Task Management
- View all extracted tasks in one place
- Mark tasks as complete
- Delete tasks you don't need

### 6. Calendar Events
- Display extracted events in a readable format
- One-click .ics file export (works with Google Calendar, Outlook, Apple Calendar, etc.)

---

## Design Direction

**Dark Professional Theme:**
- Deep charcoal/navy background
- Crisp white and muted gray text
- Accent color (electric blue or teal) for interactive elements
- Card-based layout with subtle borders/shadows
- Clean typography with good hierarchy

---

## Pages

1. **Landing Page** - Hero section explaining the app, sign up CTA
2. **Login/Sign Up** - Clean auth forms
3. **Dashboard** - Main workspace showing recent voice notes
4. **Voice Note Detail** - Full transcript with tasks, summary, events
5. **Tasks View** - All tasks across notes
6. **Settings** - Account management
7. **Action preview screen** - Show the written form of recorded note

---

## Technical Approach

- **Backend**: Lovable Cloud for database and edge functions
- **Speech-to-Text**: ElevenLabs STT API
- **AI Processing**: Lovable AI (Gemini) for extracting tasks, summaries, events
- **Database**: Store users, voice notes, tasks, and events
- **Export**: Generate .ics files client-side

---

## User Flow

1. User signs up/logs in
2. Records audio or uploads a file
3. App transcribes the audio
4. AI extracts tasks, summary, and calendar events
5. Results displayed immediately
6. User can manage tasks and export events
