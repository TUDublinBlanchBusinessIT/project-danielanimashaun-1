import React, { useEffect, useMemo, useState } from "react";
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

  const moodCounts = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      const m = e.mood || "Unknown";
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [entries]);

  const topMood = useMemo(() => {
    let best = null;
    let bestCount = 0;
    Object.keys(moodCounts).forEach((m) => {
      if (moodCounts[m] > bestCount) {
        best = m;
        bestCount = moodCounts[m];
      }
    });
    return best;
  }, [moodCounts]);

  const insight = useMemo(() => {
    if (entries.length === 0) return "Start your first reflection to let Helpr learn your emotional patterns.";
    if (!topMood) return "Your moods are mixed. Keep journaling so a clearer pattern can emerge.";
    if (topMood === "Happy" || topMood === "Calm") {
      return "Your recent pattern leans positive. Notice what environments and people support that.";
    }
    if (topMood === "Stressed" || topMood === "Sad") {
      return "You have logged heavier moods. Slowing down and checking what drains you could help.";
    }
    return "Your emotional pattern is forming. More entries will give clearer guidance.";
  }, [entries.length, topMood]);

  const recent = entries.slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.appName}>Helpr</Text>
      <Text style={styles.tagline}>A calm space to reflect and look ahead.</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total reflections</Text>
        <Text style={styles.summaryValue}>{entries.length}</Text>
        <Text style={styles.summaryMood}>
          {topMood ? "Most common mood: " + topMood : "No clear mood pattern yet"}
        </Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Helpr insight</Text>
        <Text style={styles.insightText}>{insight}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent reflections</Text>
      {recent.length === 0 ? (
        <Text style={styles.emptyText}>You have no reflections yet. Add one in the Journal tab.</Text>
      ) : (
        recent.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.entryCard}
            onPress={() =>
              navigation.navigate("Simulator", { text: item.text, mood: item.mood })
            }
          >
            <View style={styles.entryRow}>
              <Text style={styles.entryMood}>{item.mood}</Text>
              <Text style={styles.entryDate}>
                {item.timestamp && item.timestamp.toDate
                  ? item.timestamp.toDate().toLocaleString()
                  : "Recently"}
              </Text>
            </View>
            <Text style={styles.entryText} numberOfLines={2}>{item.text}</Text>
            <Text style={styles.entryHint}>Tap to explore a What-If outcome</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40, backgroundColor: "#F5F7FB" },
  appName: { fontSize: 28, fontWeight: "800", color: "#1F2933" },
  tagline: { fontSize: 13, color: "#6B7280", marginBottom: 18 },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D0D7E2"
  },
  summaryLabel: { color: "#6B7280", fontSize: 13 },
  summaryValue: { color: "#1F2933", fontSize: 32, fontWeight: "800", marginVertical: 4 },
  summaryMood: { color: "#4F6B9A", fontSize: 13, fontWeight: "600" },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D0D7E2"
  },
  insightTitle: { color: "#1F2933", fontSize: 15, fontWeight: "700", marginBottom: 6 },
  insightText: { color: "#374151", fontSize: 14, lineHeight: 20 },
  sectionTitle: { color: "#1F2933", fontSize: 16, fontWeight: "700", marginBottom: 10 },
  emptyText: { color: "#6B7280", fontSize: 14 },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D0D7E2"
  },
  entryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  entryMood: { color: "#4F6B9A", fontWeight: "700" },
  entryDate: { color: "#9CA3AF", fontSize: 11 },
  entryText: { color: "#1F2933", fontSize: 14, marginBottom: 4 },
  entryHint: { color: "#7DE3FF", fontSize: 12, fontWeight: "600" }
});
