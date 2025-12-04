import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const moods = [
  { label: "Happy", icon: "happy", color: "#fcd34d" },
  { label: "Calm", icon: "leaf", color: "#86efac" },
  { label: "Okay", icon: "remove-circle", color: "#93c5fd" },
  { label: "Stressed", icon: "flash", color: "#fca5a5" },
  { label: "Sad", icon: "rainy", color: "#c4b5fd" }
];

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
      setSavedMessage("Entry could not be saved. Check Firebase settings.");
      console.log("Firestore error:", error);
    }

    setSaving(false);
  }

  return (
    <LinearGradient colors={["#050814", "#0b1027"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Text style={styles.title}>New reflection</Text>
        <Text style={styles.subtitle}>Describe what happened and how it felt.</Text>

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
          style={styles.input}
          multiline
          placeholder="Type freely here..."
          placeholderTextColor="#64748b"
          value={text}
          onChangeText={setText}
        />

        <Text style={styles.label}>Mood</Text>
        <View style={styles.moodRow}>
          {moods.map((m) => {
            const selected = mood === m.label;
            return (
              <Pressable
                key={m.label}
                onPress={() => setMood(m.label)}
                style={[
                  styles.moodChip,
                  { borderColor: m.color },
                  selected && { backgroundColor: m.color }
                ]}
              >
                <Ionicons
                  name={m.icon}
                  size={16}
                  color={selected ? "#050814" : m.color}
                />
                <Text
                  style={[
                    styles.moodText,
                    selected && { color: "#050814" }
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={saveEntry} disabled={saving} style={styles.saveWrap}>
          <LinearGradient colors={["#7dd3fc", "#a78bfa"]} style={styles.saveButton}>
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save entry"}</Text>
          </LinearGradient>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 56 },
  title: { color: "#e2e8f0", fontSize: 24, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 14 },
  label: { color: "#e2e8f0", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  input: {
    minHeight: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#18213a",
    backgroundColor: "#0a0f23",
    color: "#e2e8f0",
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 14
  },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#050814"
  },
  moodText: { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  saveWrap: { marginTop: "auto", marginBottom: 24 },
  saveButton: { paddingVertical: 12, borderRadius: 999, alignItems: "center" },
  saveText: { color: "#050814", fontSize: 15, fontWeight: "800" },
  messageBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  messageSuccess: {
    backgroundColor: "#22c55e20",
    borderWidth: 1,
    borderColor: "#22c55e"
  },
  messageError: {
    backgroundColor: "#ef444420",
    borderWidth: 1,
    borderColor: "#ef4444"
  },
  messageText: { fontSize: 13, color: "#e2e8f0" }
});
