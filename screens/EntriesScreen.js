import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EntriesScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });
    return () => unsub();
  }, []);

  function renderItem({ item }) {
    const dateLabel =
      item.timestamp && item.timestamp.toDate
        ? item.timestamp.toDate().toLocaleString()
        : "Recently";

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.mood}>{item.mood}</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
        <Text style={styles.text}>{item.text}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("Simulator", { text: item.text, mood: item.mood })
          }
        >
          <Text style={styles.buttonText}>Run What-If</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All reflections</Text>

      {entries.length === 0 ? (
        <Text style={styles.empty}>No entries yet. Add one in the New Entry tab.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40, backgroundColor: "#020617" },
  title: { fontSize: 22, fontWeight: "700", color: "#e5e7eb", marginBottom: 16 },
  empty: { color: "#9ca3af", fontSize: 14 },
  card: {
    padding: 14,
    backgroundColor: "#020617",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 10
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  mood: { color: "#6366f1", fontWeight: "700" },
  date: { color: "#9ca3af", fontSize: 11 },
  text: { color: "#e5e7eb", fontSize: 14, marginBottom: 8 },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#6366f1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999
  },
  buttonText: { color: "#e5e7eb", fontSize: 13, fontWeight: "600" }
});
