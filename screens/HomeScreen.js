import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => unsub();
  }, []);

  const recent = entries.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Reflections:</Text>
        <Text style={styles.summaryValue}>{entries.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Reflections</Text>
      {recent.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.entryCard}
          onPress={() =>
            navigation.navigate("Simulator", { text: item.text, mood: item.mood })
          }
        >
          <Text style={styles.entryMood}>{item.mood}</Text>
          <Text numberOfLines={2} style={styles.entryText}>{item.text}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8FAFC" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  summaryBox: {
    padding: 18,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    marginBottom: 20
  },
  summaryLabel: { fontSize: 16, color: "#4B5563" },
  summaryValue: { fontSize: 32, fontWeight: "bold", color: "#4338CA" },
  sectionTitle: { fontSize: 22, fontWeight: "600", marginBottom: 10 },
  entryCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  entryMood: { fontSize: 14, color: "#6366F1", marginBottom: 4 },
  entryText: { fontSize: 16, color: "#1F2937" }
});
