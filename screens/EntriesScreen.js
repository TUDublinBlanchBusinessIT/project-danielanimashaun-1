import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function EntriesScreen() {
  const navigation = useNavigation();
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
      if (list.length === 0) {
        setSelectedEntry(null);
      } else if (selectedEntry) {
        const updated = list.find(e => e.id === selectedEntry.id);
        setSelectedEntry(updated || null);
      }
    });
    return () => unsubscribe();
  }, []);

  function formatDate(ts) {
    if (!ts) return "";
    try {
      const d = ts.toDate();
      return d.toLocaleString();
    } catch {
      return "";
    }
  }

  function handleSelect(item) {
    setSelectedEntry(item);
  }

  async function handleDelete() {
    if (!selectedEntry) return;
    Alert.alert(
      "Delete reflection",
      "Are you sure you want to delete this reflection?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const ref = doc(db, "entries", selectedEntry.id);
              await deleteDoc(ref);
              setSelectedEntry(null);
            } catch (e) {}
          }
        }
      ]
    );
  }

  function handleEdit() {
    if (!selectedEntry) return;
    navigation.navigate("New Entry", { entry: selectedEntry });
  }

  function handleSimulate() {
    if (!selectedEntry) return;
    navigation.navigate("What-If", {
      text: selectedEntry.text,
      mood: selectedEntry.mood
    });
  }

  function renderItem({ item }) {
    const isSelected = selectedEntry && selectedEntry.id === item.id;
    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.itemCard,
          isSelected && styles.itemCardActive,
          pressed && styles.itemCardPressed
        ]}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemMood}>{item.mood}</Text>
          <Text style={styles.itemDate}>{formatDate(item.timestamp)}</Text>
        </View>
        <Text style={styles.itemText} numberOfLines={2}>
          {item.text}
        </Text>
      </Pressable>
    );
  }

  return (
    <LinearGradient colors={["#020617", "#020617"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>All reflections</Text>
        <Text style={styles.subtitle}>
          Tap a reflection to see it in full, edit it, run a what-if, or delete it.
        </Text>

        {entries.length === 0 ? (
          <Text style={styles.emptyText}>
            You have no reflections yet. Start by writing your first entry on the New Entry tab.
          </Text>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}

        {selectedEntry && (
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Selected reflection</Text>
            <Text style={styles.detailMood}>{selectedEntry.mood}</Text>
            <Text style={styles.detailDate}>{formatDate(selectedEntry.timestamp)}</Text>
            <Text style={styles.detailText}>{selectedEntry.text}</Text>

            <View style={styles.detailActionsRow}>
              <Pressable
                style={[styles.actionButton, styles.actionPrimary]}
                onPress={handleSimulate}
              >
                <Text style={styles.actionPrimaryText}>Run what-if</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.actionSecondary]}
                onPress={handleEdit}
              >
                <Text style={styles.actionSecondaryText}>Edit</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.actionDanger]}
                onPress={handleDelete}
              >
                <Text style={styles.actionDangerText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 24
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#e5e7eb",
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 8
  },
  itemCard: {
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 8
  },
  itemCardActive: {
    borderColor: "#7dd3fc",
    backgroundColor: "#020617"
  },
  itemCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2
  },
  itemMood: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7dd3fc"
  },
  itemDate: {
    fontSize: 11,
    color: "#6b7280"
  },
  itemText: {
    fontSize: 13,
    color: "#cbd5e1",
    marginTop: 2
  },
  detailCard: {
    marginTop: 16,
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  detailLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4
  },
  detailMood: {
    fontSize: 16,
    color: "#a7f3d0",
    fontWeight: "700"
  },
  detailDate: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 8
  },
  detailText: {
    fontSize: 13,
    color: "#e5e7eb",
    marginBottom: 12
  },
  detailActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8
  },
  actionButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center"
  },
  actionPrimary: {
    backgroundColor: "#6366f1"
  },
  actionPrimaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#e5e7eb"
  },
  actionSecondary: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#7dd3fc"
  },
  actionSecondaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7dd3fc"
  },
  actionDanger: {
    backgroundColor: "#b91c1c"
  },
  actionDangerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fee2e2"
  }
});
