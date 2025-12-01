import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function NewEntryScreen({ navigation }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveEntry() {
    if (!text.trim() || !mood) {
      Alert.alert("Missing Information", "Please write something and pick a mood.");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "entries"), {
        text,
        mood,
        timestamp: serverTimestamp()
      });

      setText("");
      setMood("");
      navigation.navigate("Entries");
    } catch (error) {
      Alert.alert("Error", "Entry could not be saved.");
      console.log(error);
    }

    setSaving(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Reflection</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write about your day..."
        style={styles.input}
        multiline
      />

      <View style={styles.moodRow}>
        {["Happy", "Sad", "Stressed", "Calm"].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMood(m)}
            style={[styles.moodButton, mood === m && styles.moodSelected]}
          >
            <Text>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.save} onPress={saveEntry}>
        <Text style={styles.saveText}>
          {saving ? "Saving..." : "Save Entry"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8FAFC" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: {
    height: 160,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    textAlignVertical: "top"
  },
  moodRow: { flexDirection: "row", marginVertical: 20, justifyContent: "space-between" },
  moodButton: {
    padding: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    width: "23%",
    alignItems: "center"
  },
  moodSelected: { backgroundColor: "#A5B4FC" },
  save: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "600" }
});
