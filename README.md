# Optima — Neurodivergent-Friendly Task Manager

Optima is an intelligent, neurodivergent-friendly task breakdown and management mobile and web application. Built with Expo (React Native), Supabase, and Gemini AI, Optima helps users transform overwhelming goals into actionable, bite-sized subtasks categorized by estimated time, priority, and required energy levels.

---

## Features

- AI-Powered Goal Decomposition: Leverages Google GenAI (gemini-3.8-flash) with structured JSON schema outputs to automatically split daunting goals into clear steps.
- Resilient AI Execution: Built-in auto-retry logic with exponential backoff to handle API traffic spikes gracefully.
- SSR-Safe and Web-Ready: Configured with a custom storage adapter and SPA single-page output mode to eliminate window pre-rendering errors on Expo Web.
- Supabase Integration: Secure database persistence and authentication layer using @supabase/supabase-js.
- Neurodivergent-Focused UI: Minimalistic, distraction-free interface prioritizing low energy friction and clear visual hierarchy.

---

## Tech Stack

- Framework: Expo (React Native) + Expo Router (SPA Mode)
- Database & Auth: Supabase (@supabase/supabase-js, @react-native-async-storage/async-storage)
- AI Engine: Google GenAI SDK (@google/genai) using gemini-3.8-flash
- Polyfills: react-native-url-polyfill for cross-platform URL compatibility

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Expo Go app on your iOS/Android device (or an Xcode/Android Studio emulator)

### 1. Clone the Repository

```bash
git clone [https://github.com/macgoldn-prog/optima-app.git](https://github.com/macgoldn-prog/optima-app.git)
cd optima-app
