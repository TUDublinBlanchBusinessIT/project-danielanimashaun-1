import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const moods = ["Happy", "Calm", "Okay", "Stressed", "Sad"];

export default function NewEntryScreen() {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  async function saveEntry() {
    if (!text.trim() || !mood) {
      setSavedMessage("Please write something and select a mood.");
      return;
    }

    setSaving(true);
    setSavedMessage("");

    try {
      await addDoc(collection(db, "entries"), {
        text,
        mood,
        timestamp: serverTimestamp()
      });

      setText("");
      setMood("");
      setSavedMessage("Entry saved. You can add another reflection.");
    } catch (error) {
      setSavedMessage("Entry could not be saved. Check your Firebase settings.");
      console.log(error);
    }

    setSaving(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New reflection</Text>
      <Text style={styles.subtitle}>
        Capture what happened and how you feel so Helpr can learn your patterns.
      </Text>

      {savedMessage !== "" && (
        <View
          style={[
            styles.messageBox,
            savedMessage.startsWith("Entry saved")
              ? styles.messageSuccess
              : styles.messageError
          ]}
        >
          <Text style={styles.messageText}>{savedMessage}</Text>
        </View>
      )}

      <Text style={styles.label}>Your entry</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write freely about your day, emotions or a specific situation..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        multiline
      />

      <Text style={styles.label}>Mood</Text>
      <View style={styles.moodRow}>
        {moods.map((m) => {
          const selected = mood === m;
          return (
            <TouchableOpacity
              key={m}
              onPress={() => setMood(m)}
              style={[styles.moodButton, selected && styles.moodSelected]}
            >
              <Text style={[styles.moodText, selected && styles.moodTextSelected]}>{m}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.counter}>{text.length} characters</Text>

      <TouchableOpacity style={styles.save} onPress={saveEntry} disabled={saving}>
        <Text style={styles.saveText}>{saving ? "Saving..." : "Save entry"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40, backgroundColor: "#F5F7FB" },
  title: { fontSize: 26, fontWeight: "800", color: "#1F2933", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#6B7280", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#1F2933", marginBottom: 6 },
  input: {
    minHeight: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D0D7E2",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 14
  },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  moodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D0D7E2",
    backgroundColor: "#FFFFFF"
  },
  moodSelected: {
    backgroundColor: "#4F6B9A",
    borderColor: "#4F6B9A"
  },
  moodText: { color: "#1F2933", fontSize: 13, fontWeight: "500" },
  moodTextSelected: { color: "#FFFFFF", fontWeight: "700" },
  counter: { fontSize: 12, color: "#6B7280", marginBottom: 18 },
  save: {
    marginTop: "auto",
    marginBottom: 20,
    backgroundColor: "#4F6B9A",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center"
  },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  messageBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  messageSuccess: {
    backgroundColor: "#E2F4E6",
    borderWidth: 1,
    borderColor: "#9FBF9B"
  },
  messageError: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#F97373"
  },
  messageText: { fontSize: 13, color: "#1F2933" }
});
