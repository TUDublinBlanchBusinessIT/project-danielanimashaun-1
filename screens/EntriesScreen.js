import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ScrollView
} from "react-native";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EntriesScreen() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "entries"), orderBy("timestamp", "desc"));
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
      if (selectedEntry) {
        const updated = list.find(e => e.id === selectedEntry.id);
        if (!updated) {
          setSelectedEntry(null);
        } else {
          setSelectedEntry(updated);
        }
      }
    });
    return () => unsubscribe();
  }, [selectedEntry?.id]);

  function formatDate(ts) {
    if (!ts) return "No date";
    try {
      const date = ts.toDate();
      return date.toLocaleString();
    } catch {
      return "No date";
    }
  }

  async function handleDelete() {
    if (!selectedEntry) return;

    const confirm = () => {
      deleteDoc(doc(db, "entries", selectedEntry.id))
        .then(() => {
          setSelectedEntry(null);
        })
        .catch(() => {
          Alert.alert("Could not delete", "Something went wrong while removing this entry.");
        });
    };

    if (Platform.OS === "web") {
      const ok = window.confirm("Are you sure you want to delete this reflection?");
      if (ok) confirm();
    } else {
      Alert.alert(
        "Delete reflection",
        "Are you sure you want to delete this reflection?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirm }
        ]
      );
    }
  }

  function renderItem({ item }) {
    return (
      <Pressable
        onPress={() => setSelectedEntry(item)}
        style={[
          styles.item,
          selectedEntry && selectedEntry.id === item.id && styles.itemSelected
        ]}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.mood}>{item.mood}</Text>
          <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={2}>
          {item.text}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All reflections</Text>
      <Text style={styles.subtitle}>
        Tap any reflection to see more detail and manage it.
      </Text>

      {entries.length === 0 ? (
        <Text style={styles.empty}>
          Once you start writing, all of your reflections will appear here.
        </Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: selectedEntry ? 180 : 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedEntry && (
        <View style={styles.detailContainer}>
          <ScrollView
            style={styles.detailScroll}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.detailLabel}>Mood</Text>
            <Text style={styles.detailMood}>{selectedEntry.mood}</Text>

            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailDate}>{formatDate(selectedEntry.timestamp)}</Text>

            <Text style={styles.detailLabel}>Full reflection</Text>
            <Text style={styles.detailText}>{selectedEntry.text}</Text>
          </ScrollView>

          <View style={styles.detailButtons}>
            <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.closeButton]} onPress={() => setSelectedEntry(null)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", paddingHorizontal: 18, paddingTop: 40 },
  title: { color: "#e5e7eb", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#9ca3af", fontSize: 13, marginBottom: 16 },
  empty: { color: "#9ca3af", fontSize: 13, marginTop: 12 },
  item: {
    backgroundColor: "#0b1023",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#151a33"
  },
  itemSelected: {
    borderColor: "#7dd3fc",
    backgroundColor: "#050816"
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  mood: { color: "#7dd3fc", fontSize: 14, fontWeight: "700" },
  date: { color: "#6b7280", fontSize: 11 },
  preview: { color: "#cbd5e1", fontSize: 13 },
  detailContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#020617",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderTopColor: "#151a33",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    maxHeight: "55%"
  },
  detailScroll: { flex: 1 },
  detailLabel: { color: "#9ca3af", fontSize: 12, fontWeight: "600", marginTop: 4 },
  detailMood: { color: "#7dd3fc", fontSize: 18, fontWeight: "800" },
  detailDate: { color: "#e5e7eb", fontSize: 12, marginTop: 2 },
  detailText: { color: "#e5e7eb", fontSize: 13, marginTop: 6, lineHeight: 20 },
  detailButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center"
  },
  deleteButton: { backgroundColor: "#fca5a5" },
  closeButton: { backgroundColor: "#1f2937" },
  deleteText: { color: "#111827", fontSize: 14, fontWeight: "700" },
  closeText: { color: "#e5e7eb", fontSize: 14, fontWeight: "700" }
});
