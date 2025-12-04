import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function HomeScreen() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "entries"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(items);
    });

    return () => unsubscribe();
  }, []);

  function renderItem({ item }) {
    return (
      <View style={styles.entryCard}>
        <Text style={styles.mood}>{item.mood}</Text>
        <Text style={styles.text} numberOfLines={2}>
          {item.text}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#050814", "#0b1027"]} style={styles.container}>
      <Text style={styles.title}>Helpr</Text>
      <Text style={styles.subtitle}>
        Your recent reflections and how you have been feeling.
      </Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total reflections</Text>
        <Text style={styles.summaryValue}>{entries.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent entries</Text>
      {entries.length === 0 ? (
        <Text style={styles.emptyText}>
          No entries yet. Add your first reflection on the New tab.
        </Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 56 },
  title: { color: "#e2e8f0", fontSize: 26, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 16 },
  summaryBox: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16
  },
  summaryLabel: { color: "#94a3b8", fontSize: 13, marginBottom: 4 },
  summaryValue: { color: "#e2e8f0", fontSize: 24, fontWeight: "800" },
  sectionTitle: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8
  },
  emptyText: { color: "#64748b", fontSize: 13 },
  entryCard: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10
  },
  mood: { color: "#a5b4fc", fontSize: 13, fontWeight: "700", marginBottom: 4 },
  text: { color: "#e2e8f0", fontSize: 13 }
});
