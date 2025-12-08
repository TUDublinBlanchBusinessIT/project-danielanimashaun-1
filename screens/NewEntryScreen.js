import React, { useEffect, useState } from "react";
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
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRoute, useNavigation } from "@react-navigation/native";

const moods = [
  { label: "Happy", icon: "happy", color: "#fbbf24" },
  { label: "Calm", icon: "leaf", color: "#22c55e" },
  { label: "Okay", icon: "remove-circle", color: "#38bdf8" },
  { label: "Stressed", icon: "flash", color: "#f97373" },
  { label: "Sad", icon: "rainy", color: "#a855f7" }
];

export default function NewEntryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const editingEntry = route.params && route.params.entry ? route.params.entry : null;

  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editingEntry) {
      setText(editingEntry.text || "");
      setMood(editingEntry.mood || "");
    } else {
      setText("");
      setMood("");
    }
    setMessage("");
  }, [editingEntry]);

  async function handleSave() {
    if (!text.trim() || !mood) {
      setMessage("Please write something and select a mood.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      if (editingEntry) {
        const ref = doc(db, "entries", editingEntry.id);
        await updateDoc(ref, {
          text,
          mood
        });
        setMessage("Reflection updated.");
      } else {
        await addDoc(collection(db, "entries"), {
          text,
          mood,
          timestamp: serverTimestamp()
        });
        setText("");
        setMood("");
        setMessage("Entry saved. You can add another reflection.");
      }
    } catch (e) {
      setMessage("Something went wrong saving this entry.");
    }
    setSaving(false);
  }

  const title = editingEntry ? "Edit reflection" : "New reflection";
  const subtitle = editingEntry
    ? "Update how you feel and what has changed."
    : "Describe what happened and how it felt.";

  return (
    <LinearGradient colors={["#020617", "#020617"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

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
          {moods.map(m => {
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
                  color={selected ? "#020617" : m.color}
                />
                <Text
                  style={[
                    styles.moodText,
                    selected && { color: "#020617" }
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {message !== "" && <Text style={styles.message}>{message}</Text>}

        <Pressable onPress={handleSave} disabled={saving} style={styles.saveWrap}>
          <LinearGradient colors={["#7dd3fc", "#a78bfa"]} style={styles.saveButton}>
            <Text style={styles.saveText}>{saving ? "Saving..." : editingEntry ? "Save changes" : "Save entry"}</Text>
          </LinearGradient>
        </Pressable>

        {editingEntry && (
          <Pressable
            style={styles.backLinkWrap}
            onPress={() => navigation.navigate("Entries")}
          >
            <Text style={styles.backLink}>Back to all reflections</Text>
          </Pressable>
        )}
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
    backgroundColor: "#020617",
    color: "#e2e8f0",
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 14
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#020617"
  },
  moodText: { color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  message: {
    fontSize: 12,
    color: "#a5b4fc",
    marginBottom: 10,
    marginTop: 2
  },
  saveWrap: { marginTop: "auto", marginBottom: 16 },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center"
  },
  saveText: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "800"
  },
  backLinkWrap: {
    alignItems: "center",
    marginBottom: 10
  },
  backLink: {
    fontSize: 12,
    color: "#7dd3fc",
    textDecorationLine: "underline"
  }
});
