import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("timestamp", "desc"), limit(30));
    const unsubscribe = onSnapshot(q, snapshot => {
      const list = [];
      snapshot.forEach(d => {
        const data = d.data();
        list.push({
          id: d.id,
          text: data.text || "",
          mood: data.mood || "Unknown",
          timestamp: data.timestamp
        });
      });
      setEntries(list);
    });
    return () => unsubscribe();
  }, []);

  const totalReflections = entries.length;

  const moods = ["Happy", "Calm", "Okay", "Stressed", "Sad"];
  const moodCounts = moods.reduce((acc, m) => {
    acc[m] = 0;
    return acc;
  }, {});
  entries.forEach(e => {
    if (moodCounts[e.mood] !== undefined) {
      moodCounts[e.mood] = moodCounts[e.mood] + 1;
    }
  });

  let dominantMood = "No reflections yet";
  let dominantCount = 0;
  moods.forEach(m => {
    const c = moodCounts[m];
    if (c > dominantCount) {
      dominantCount = c;
      dominantMood = m;
    }
  });

  const recentEntries = entries.slice(0, 3);

  function formatShort(ts) {
    if (!ts) return "";
    try {
      const d = ts.toDate();
      return d.toLocaleDateString();
    } catch {
      return "";
    }
  }

  function renderEntry({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("Entries")}
        style={({ pressed }) => [
          styles.entryCard,
          pressed && styles.entryCardPressed
        ]}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryMood}>{item.mood}</Text>
          <Text style={styles.entryDate}>{formatShort(item.timestamp)}</Text>
        </View>
        <Text style={styles.entryText} numberOfLines={2}>
          {item.text}
        </Text>
      </Pressable>
    );
  }

  return (
    <LinearGradient
      colors={["#020617", "#020617"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.appName}>Helpr</Text>
          <Text style={styles.tagline}>
            A calm space to see how you are really doing.
          </Text>

          <View style={styles.statsRow}>
            <LinearGradient
              colors={["#1d4ed8", "#22d3ee"]}
              style={styles.statCardPrimary}
            >
              <Text style={styles.statLabelLight}>Total reflections</Text>
              <Text style={styles.statValueLight}>{totalReflections}</Text>
              <Text style={styles.statHintLight}>
                Every entry teaches Helpr more about you.
              </Text>
            </LinearGradient>

            <View style={styles.statColumnRight}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Most frequent mood</Text>
                <Text style={styles.statValue}>{dominantMood}</Text>
              </View>
              <View style={[styles.statCard, { marginTop: 8 }]}>
                <Text style={styles.statLabel}>Today’s action</Text>
                <Pressable
                  onPress={() => navigation.navigate("New Entry")}
                  style={styles.ctaChip}
                >
                  <Text style={styles.ctaText}>Write a new reflection</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent reflections</Text>
            <Pressable onPress={() => navigation.navigate("Entries")}>
              <Text style={styles.sectionLink}>View all</Text>
            </Pressable>
          </View>

          {recentEntries.length === 0 ? (
            <Text style={styles.emptyText}>
              You do not have any reflections yet. Start with one honest entry.
            </Text>
          ) : (
            <FlatList
              data={recentEntries}
              keyExtractor={item => item.id}
              renderItem={renderEntry}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood pattern snapshot</Text>
          </View>
          {totalReflections === 0 ? (
            <Text style={styles.emptyText}>
              Once you have a few entries, Helpr will show how your moods have been trending.
            </Text>
          ) : (
            <View style={styles.moodGraph}>
              {moods.map(m => {
                const count = moodCounts[m];
                const height = 10 + count * 8;
                return (
                  <View key={m} style={styles.moodBarItem}>
                    <View style={[styles.moodBar, { height }]}>
                      <LinearGradient
                        colors={
                          m === "Happy"
                            ? ["#fbbf24", "#f97316"]
                            : m === "Calm"
                            ? ["#22c55e", "#4ade80"]
                            : m === "Okay"
                            ? ["#38bdf8", "#0ea5e9"]
                            : m === "Stressed"
                            ? ["#f97373", "#ef4444"]
                            : ["#a855f7", "#6366f1"]
                        }
                        style={styles.moodBarFill}
                      />
                    </View>
                    <Text style={styles.moodBarLabel}>{m}</Text>
                    <Text style={styles.moodBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Helpr shortcuts</Text>
          </View>

          <View style={styles.shortcutRow}>
            <Pressable
              style={({ pressed }) => [
                styles.shortcutCard,
                styles.shortcutBlue,
                pressed && styles.shortcutPressed
              ]}
              onPress={() => navigation.navigate("New Entry")}
            >
              <Text style={styles.shortcutTitle}>End of day check-in</Text>
              <Text style={styles.shortcutText}>
                Capture how today felt in a few honest lines.
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.shortcutCard,
                styles.shortcutGreen,
                pressed && styles.shortcutPressed
              ]}
              onPress={() => navigation.navigate("What-If")}
            >
              <Text style={styles.shortcutTitle}>What-if moment</Text>
              <Text style={styles.shortcutText}>
                Try a gentle what-if on a choice you are holding.
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 32
  },
  hero: {
    marginBottom: 24
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e5e7eb",
    letterSpacing: 0.5
  },
  tagline: {
    fontSize: 13,
    color: "#cbd5e1",
    marginTop: 4,
    maxWidth: 260
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 18
  },
  statCardPrimary: {
    flex: 1.2,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginRight: 10
  },
  statLabelLight: {
    fontSize: 12,
    color: "#e5e7eb",
    opacity: 0.9
  },
  statValueLight: {
    fontSize: 28,
    color: "#f9fafb",
    fontWeight: "800",
    marginTop: 4
  },
  statHintLight: {
    fontSize: 11,
    color: "#e5e7eb",
    opacity: 0.9,
    marginTop: 6
  },
  statColumnRight: {
    flex: 1,
    justifyContent: "space-between"
  },
  statCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 4
  },
  statValue: {
    fontSize: 15,
    color: "#a7f3d0",
    fontWeight: "700"
  },
  ctaChip: {
    marginTop: 2,
    alignSelf: "flex-start",
    backgroundColor: "#22c55e",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#022c22"
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb"
  },
  sectionLink: {
    fontSize: 12,
    color: "#7dd3fc",
    fontWeight: "600"
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4
  },
  entryCard: {
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 8
  },
  entryCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }]
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2
  },
  entryMood: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7dd3fc"
  },
  entryDate: {
    fontSize: 11,
    color: "#6b7280"
  },
  entryText: {
    fontSize: 13,
    color: "#cbd5e1",
    marginTop: 2
  },
  moodGraph: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4
  },
  moodBarItem: {
    alignItems: "center",
    flex: 1
  },
  moodBar: {
    width: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "flex-end"
  },
  moodBarFill: {
    width: "100%",
    height: "100%",
    borderRadius: 999
  },
  moodBarLabel: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 4
  },
  moodBarCount: {
    fontSize: 10,
    color: "#e5e7eb",
    marginTop: 2
  },
  shortcutRow: {
    flexDirection: "row",
    gap: 10
  },
  shortcutCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  shortcutBlue: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1d4ed8"
  },
  shortcutGreen: {
    backgroundColor: "#022c22",
    borderWidth: 1,
    borderColor: "#22c55e"
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 4
  },
  shortcutText: {
    fontSize: 12,
    color: "#cbd5e1"
  },
  shortcutPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  }
});
