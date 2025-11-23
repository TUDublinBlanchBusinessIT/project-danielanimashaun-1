import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const moodMeta = {
  Happy: { icon: "happy", color: "#fcd34d" },
  Calm: { icon: "leaf", color: "#86efac" },
  Okay: { icon: "remove-circle", color: "#93c5fd" },
  Stressed: { icon: "flash", color: "#fca5a5" },
  Sad: { icon: "rainy", color: "#c4b5fd" }
};

export default function HomeScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setEntries(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      const m = e.mood || "Okay";
      counts[m] = (counts[m] || 0) + 1;
    });
    let topMood = null;
    let topCount = 0;
    Object.keys(counts).forEach((m) => {
      if (counts[m] > topCount) {
        topMood = m;
        topCount = counts[m];
      }
    });
    return { counts, topMood, topCount };
  }, [entries]);

  const insight = useMemo(() => {
    if (entries.length === 0) return "Start your first reflection to let Helpr learn your patterns.";
    if (!stats.topMood) return "Your emotions look mixed. Keep journaling so Helpr can spot deeper patterns.";
    if (stats.topMood === "Happy" || stats.topMood === "Calm")
      return "Your recent pattern leans positive. Notice what supports this mood and protect it.";
    if (stats.topMood === "Sad" || stats.topMood === "Stressed")
      return "You’ve been recording heavier emotions lately. Try slowing down, resting, and checking what’s draining you.";
    return "Your pattern is forming. Keep writing — the clarity grows with consistency.";
  }, [entries.length, stats.topMood]);

  const recentPreview = entries.slice(0, 3);

  return (
    <LinearGradient colors={["#050814", "#0b1027", "#050814"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Helpr</Text>
        <Text style={styles.subtitle}>reflect • predict • evolve</Text>
      </View>

      <View style={styles.ringCard}>
        <LinearGradient colors={["#0f172a", "#0b1120"]} style={styles.ringInner}>
          <Text style={styles.ringLabel}>Total entries</Text>
          {loading ? (
            <ActivityIndicator color="#e2e8f0" />
          ) : (
            <Text style={styles.ringNumber}>{entries.length}</Text>
          )}
          <Text style={styles.ringSub}>
            {stats.topMood ? `Most common: ${stats.topMood}` : "No pattern yet"}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="sparkles" size={18} color="#7dd3fc" />
          <Text style={styles.cardTitle}>Helpr Insight</Text>
        </View>
        <Text style={styles.cardText}>{insight}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitleSmall}>Your mood mix</Text>
        <View style={styles.moodRow}>
          {Object.keys(moodMeta).map((m) => {
            const c = stats.counts[m] || 0;
            return (
              <View key={m} style={[styles.moodChip, { borderColor: moodMeta[m].color }]}>
                <Ionicons name={moodMeta[m].icon} size={14} color={moodMeta[m].color} />
                <Text style={styles.moodChipText}>{m}</Text>
                <Text style={styles.moodChipCount}>{c}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent reflections</Text>
      {loading ? (
        <ActivityIndicator color="#e2e8f0" />
      ) : (
        <FlatList
          data={recentPreview}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const meta = moodMeta[item.mood] || moodMeta.Okay;
            const dateLabel =
              item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "Just now";
            return (
              <View style={styles.entryCard}>
                <View style={styles.entryTop}>
                  <View style={[styles.moodDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.entryMood}>{item.mood}</Text>
                  <Text style={styles.entryDate}>{dateLabel}</Text>
                </View>
                <Text style={styles.entryText} numberOfLines={2}>
                  {item.text}
                </Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 56 },
  header: { marginBottom: 18 },
  title: { color: "#e2e8f0", fontSize: 28, fontWeight: "800", letterSpacing: 1 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
  ringCard: { alignItems: "center", marginBottom: 14 },
  ringInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: "#7dd3fc",
    alignItems: "center",
    justifyContent: "center"
  },
  ringLabel: { color: "#94a3b8", fontSize: 12 },
  ringNumber: { color: "#e2e8f0", fontSize: 42, fontWeight: "800", marginTop: 2 },
  ringSub: { color: "#cbd5e1", fontSize: 12, marginTop: 6 },
  card: {
    backgroundColor: "#0b1120",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#18213a",
    marginBottom: 10
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  cardTitle: { color: "#e2e8f0", fontSize: 16, fontWeight: "700" },
  cardTitleSmall: { color: "#e2e8f0", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  cardText: { color: "#cbd5e1", fontSize: 14, lineHeight: 20 },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#050814"
  },
  moodChipText: { color: "#e2e8f0", fontSize: 12, fontWeight: "600" },
  moodChipCount: { color: "#94a3b8", fontSize: 12 },
  sectionTitle: { color: "#e2e8f0", fontSize: 14, fontWeight: "700", marginTop: 6, marginBottom: 6 },
  entryCard: {
    backgroundColor: "#0a0f23",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#18213a",
    marginBottom: 8
  },
  entryTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  entryMood: { color: "#e2e8f0", fontWeight: "700" },
  entryDate: { color: "#94a3b8", fontSize: 11, marginLeft: "auto" },
  entryText: { color: "#cbd5e1", fontSize: 14, lineHeight: 19 }
});
