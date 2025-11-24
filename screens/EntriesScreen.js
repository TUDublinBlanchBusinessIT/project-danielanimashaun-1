import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const moodColor = {
  Happy: "#fcd34d",
  Calm: "#86efac",
  Okay: "#93c5fd",
  Stressed: "#fca5a5",
  Sad: "#c4b5fd"
};

export default function EntriesScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setEntries(list);
    });
    return () => unsub();
  }, []);

  return (
    <LinearGradient colors={["#050814", "#0b1027"]} style={styles.container}>
      <Text style={styles.title}>Your reflections</Text>
      <Text style={styles.subtitle}>Tap an entry to run a What-If outcome.</Text>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No entries yet. Add one in “New Entry”.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const color = moodColor[item.mood] || "#93c5fd";
            const dateLabel =
              item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "Just now";
            return (
              <View style={styles.card}>
                <View style={styles.headRow}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.mood}>{item.mood}</Text>
                  <Text style={styles.date}>{dateLabel}</Text>
                </View>

                <Text style={styles.text}>{item.text}</Text>

                <Pressable
                  onPress={() => navigation.navigate("Simulator", { text: item.text, mood: item.mood })}
                  style={styles.whatIfBtn}
                >
                  <Ionicons name="crystal-ball" size={14} color="#050814" />
                  <Text style={styles.whatIfText}>What-If</Text>
                </Pressable>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 56 },
  title: { color: "#e2e8f0", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 12 },
  card: {
    backgroundColor: "#0a0f23",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#18213a",
    marginBottom: 8
  },
  headRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  mood: { color: "#e2e8f0", fontWeight: "800" },
  date: { color: "#94a3b8", fontSize: 11, marginLeft: "auto" },
  text: { color: "#cbd5e1", fontSize: 14, lineHeight: 19, marginBottom: 8 },
  whatIfBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#7dd3fc"
  },
  whatIfText: { color: "#050814", fontSize: 12, fontWeight: "900" },
  empty: {
    marginTop: 40,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#18213a",
    backgroundColor: "#0a0f23"
  },
  emptyText: { color: "#94a3b8", textAlign: "center", fontSize: 14 }
});
