Helpr Description

Helpr is a mobile journaling app built with React Native and Firebase.  
It helps users reflect on their emotions, recognise behavioural patterns, and explore possible outcomes through a simple What-If simulator.  
This app is a functional subset of the design completed in CA1.

---

Features

- Write and save journal reflections  
- Select a mood for each entry  
- View saved entries from Firestore  
- Run a “What-If” emotional outcome simulator  
- Calm, minimal UI based on CA1 style guide

---

Tech Used

React Native (Expo)  
Firebase Firestore  
React Navigation  

---

How It Works

Entries are saved to Firestore with text, mood, and timestamp.
Home and Entries screens read this data and update automatically.
The simulator gives a simple predicted emotional outcome based on the user’s mood and chosen action
