import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EntriesScreen() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("timestamp", "desc"));

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
      <View style={styles.card}>
        <Text style={styles.mood}>{item.mood}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All reflections</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>No entries yet. Add one from the New Entry tab.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 56, backgroundColor: "#050814" },
  title: { color: "#e2e8f0", fontSize: 22, fontWeight: "800", marginBottom: 16 },
  empty: { color: "#64748b", fontSize: 13 },
  card: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10
  },
  mood: { color: "#7dd3fc", fontSize: 13, fontWeight: "700", marginBottom: 4 },
  text: { color: "#e2e8f0", fontSize: 13 }
});
