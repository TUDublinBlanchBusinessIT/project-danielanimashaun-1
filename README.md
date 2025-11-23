# Helpr

Helpr is a reflective journaling and emotional insight mobile app built in React Native with Expo.  
It helps users record daily experiences, tag emotions, and view personalised mood patterns over time.  
The app is designed as a proof-of-concept for a larger system that could support emotional self-awareness, decision clarity, and behavioural insight.

---

## Core Idea
Helpr combines three simple actions:
1. **Reflect** — users log short journal entries and select a mood.
2. **Track** — entries are saved securely to Firebase Firestore.
3. **Insight** — the app processes mood history to show patterns and a short wellness insight.

This provides a clear foundation for future expansion, such as scenario simulations and deeper emotional forecasting.

---

## Features Implemented (CA2 Scope)
- Bottom-tab navigation (Home / New Entry / Entries)
- Create journal entries with mood tagging
- Save entries to Firebase Firestore
- Retrieve entries in real time from Firebase
- Mood pattern processing (most common mood + mood mix)
- Dashboard insight based on user history
- Responsive UI for mobile and web preview via Expo

---

## Screens
### Home
- Displays total entries
- Identifies most common mood
- Shows mood distribution
- Shows recent entries preview
- Auto-updates in real time

### New Entry
- Add a journal reflection
- Select mood using mood chips
- Save directly to Firestore

### Entries
- Lists all saved reflections
- Shows mood + timestamps
- Updates instantly after saving new entries

---

## Tech Stack
- React Native (Expo CLI)
- Firebase Firestore
- React Navigation (Bottom Tabs)
- Expo Linear Gradient
- Expo Vector Icons

---

## How to Run Locally
1. Install dependencies:
   ```bash
   npm install
