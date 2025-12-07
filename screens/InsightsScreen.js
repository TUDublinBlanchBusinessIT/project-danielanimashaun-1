import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const lastFive = entries.slice(0, 5);
const earlierFive = entries.slice(5, 10);


const moodOrder = ["Happy", "Calm", "Okay", "Stressed", "Sad"];

export default function InsightsScreen() {
  const [entries, setEntries] = useState([]);
  const [moodCounts, setMoodCounts] = useState({});
  const [mostCommonMood, setMostCommonMood] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, snapshot => {
      const docs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          text: data.text || "",
          mood: data.mood || "Unknown",
          timestamp: data.timestamp
        });
      });
      setEntries(docs);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const counts = {};
    entries.forEach(e => {
      const mood = e.mood || "Unknown";
      counts[mood] = (counts[mood] || 0) + 1;
    });
    setMoodCounts(counts);

    let maxMood = null;
    let maxCount = 0;
    Object.keys(counts).forEach(mood => {
      if (counts[mood] > maxCount) {
        maxCount = counts[mood];
        maxMood = mood;
      }
    });
    setMostCommonMood(maxMood);
  }, [entries]);

  const total = entries.length;
  const maxCount = Math.max(1, ...Object.values(moodCounts));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>A simple view of how you have been feeling over time.</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total reflections</Text>
        <Text style={styles.cardValue}>{total}</Text>
        <Text style={styles.cardHint}>Each entry helps Helpr learn your emotional patterns.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Most common mood</Text>
        <Text style={styles.cardValue}>{mostCommonMood || "Not enough data yet"}</Text>
        <Text style={styles.cardHint}>
          This is the mood that appears most often in your reflections so far.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Mood breakdown</Text>
      {total === 0 ? (
        <Text style={styles.emptyText}>Once you start writing, this screen will show how your moods shift over time.</Text>
      ) : (
        moodOrder.map(mood => {
          const count = moodCounts[mood] || 0;
          if (count === 0) return null;
          const widthPercent = (count / maxCount) * 100;

          return (
            <View key={mood} style={styles.row}>
              <Text style={styles.moodLabel}>{mood}</Text>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
              </View>
              <Text style={styles.countLabel}>{count}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", paddingHorizontal: 18, paddingTop: 40 },
  title: { color: "#e5e7eb", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#9ca3af", fontSize: 13, marginBottom: 18, lineHeight: 18 },
  card: {
    backgroundColor: "#0b1023",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#151a33",
    marginBottom: 12
  },
  cardLabel: { color: "#9ca3af", fontSize: 13, fontWeight: "600" },
  cardValue: { color: "#7dd3fc", fontSize: 24, fontWeight: "800", marginTop: 4 },
  cardHint: { color: "#cbd5e1", fontSize: 12, marginTop: 2 },
  sectionTitle: { color: "#e5e7eb", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: "#9ca3af", fontSize: 13, lineHeight: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6
  },
  moodLabel: { color: "#e5e7eb", fontSize: 13, width: 70 },
  barBackground: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#111827",
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#a78bfa"
  },
  countLabel: { color: "#cbd5e1", fontSize: 12, width: 24, textAlign: "right" }
});
