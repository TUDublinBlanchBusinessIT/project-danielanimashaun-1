import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ScrollView,
  TextInput
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const moods = ["All", "Happy", "Calm", "Okay", "Stressed", "Sad"];

export default function EntriesScreen() {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterMood, setFilterMood] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

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
          setEditing(false);
          setEditText("");
        } else {
          setSelectedEntry(updated);
          if (editing && editText.trim().length === 0) {
            setEditText(updated.text);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [selectedEntry?.id, editing, editText]);

  function formatDate(ts) {
    if (!ts) return "No date";
    try {
      const date = ts.toDate();
      return date.toLocaleString();
    } catch {
      return "No date";
    }
  }

  function handleSelect(item) {
    setSelectedEntry(item);
    setEditing(false);
    setEditText(item.text);
  }

  async function handleDelete() {
    if (!selectedEntry) return;

    const confirm = () => {
      deleteDoc(doc(db, "entries", selectedEntry.id))
        .then(() => {
          setSelectedEntry(null);
          setEditing(false);
          setEditText("");
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

  async function handleSaveEdit() {
    if (!selectedEntry) return;
    if (!editText.trim()) {
      Alert.alert("Empty entry", "Write something before saving.");
      return;
    }

    try {
      await updateDoc(doc(db, "entries", selectedEntry.id), {
        text: editText.trim()
      });
      setEditing(false);
    } catch {
      Alert.alert("Could not save changes", "Something went wrong while updating this entry.");
    }
  }

  function handleOpenSimulator() {
    if (!selectedEntry) return;
    navigation.navigate("Simulator", {
      text: selectedEntry.text,
      mood: selectedEntry.mood
    });
  }

  function applyFilters(list) {
    const moodFiltered =
      filterMood === "All"
        ? list
        : list.filter(e => e.mood === filterMood);

    if (!search.trim()) return moodFiltered;
    const s = search.toLowerCase();
    return moodFiltered.filter(e => e.text.toLowerCase().includes(s));
  }

  function renderItem({ item }) {
    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.item,
          selectedEntry && selectedEntry.id === item.id && styles.itemSelected,
          pressed && styles.itemPressed
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

  const filteredEntries = applyFilters(entries);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All reflections</Text>
      <Text style={styles.subtitle}>
        Filter, search and manage how you have been feeling.
      </Text>

      <View style={styles.filterRow}>
        {moods.map(m => {
          const active = filterMood === m;
          return (
            <Pressable
              key={m}
              onPress={() => setFilterMood(m)}
              style={({ pressed }) => [
                styles.filterChip,
                active && styles.filterChipActive,
                pressed && styles.filterChipPressed
              ]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{m}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search reflections..."
        placeholderTextColor="#64748b"
        style={styles.search}
      />

      {filteredEntries.length === 0 ? (
        <Text style={styles.empty}>
          No reflections found. Try changing your filters or write something new.
        </Text>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: selectedEntry ? 190 : 40 }}
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

            <Text style={styles.detailLabel}>Reflection</Text>
            {editing ? (
              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                style={styles.detailInput}
              />
            ) : (
              <Text style={styles.detailText}>{selectedEntry.text}</Text>
            )}
          </ScrollView>

          <View style={styles.detailButtonsRow}>
            {editing ? (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.saveButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.closeButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={() => {
                    setEditing(false);
                    setEditText(selectedEntry.text);
                  }}
                >
                  <Text style={styles.closeText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.primaryButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={handleOpenSimulator}
                >
                  <Text style={styles.primaryText}>Try what-if</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.editButton,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              </>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.deleteButton,
              pressed && styles.buttonPressed
            ]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteText}>Delete reflection</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", paddingHorizontal: 18, paddingTop: 40 },
  title: { color: "#e5e7eb", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#9ca3af", fontSize: 13, marginBottom: 14 },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  },
  filterChip: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#050814"
  },
  filterChipActive: {
    backgroundColor: "#7dd3fc",
    borderColor: "#7dd3fc"
  },
  filterChipPressed: {
    opacity: 0.8
  },
  filterText: { color: "#9ca3af", fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: "#050814" },
  search: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 14
  },
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
  itemPressed: {
    opacity: 0.8
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
    paddingTop: 10,
    paddingBottom: 16,
    maxHeight: "55%"
  },
  detailScroll: { flex: 1 },
  detailLabel: { color: "#9ca3af", fontSize: 12, fontWeight: "600", marginTop: 4 },
  detailMood: { color: "#7dd3fc", fontSize: 18, fontWeight: "800", marginTop: 2 },
  detailDate: { color: "#e5e7eb", fontSize: 12, marginTop: 2 },
  detailText: { color: "#e5e7eb", fontSize: 13, marginTop: 6, lineHeight: 20 },
  detailInput: {
    marginTop: 6,
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#050814",
    color: "#e5e7eb",
    padding: 10,
    textAlignVertical: "top",
    fontSize: 13
  },
  detailButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 8
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 9,
    alignItems: "center"
  },
  primaryButton: {
    backgroundColor: "#7dd3fc"
  },
  primaryText: {
    color: "#050814",
    fontSize: 14,
    fontWeight: "700"
  },
  editButton: {
    backgroundColor: "#1f2937"
  },
  editText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700"
  },
  saveButton: {
    backgroundColor: "#22c55e"
  },
  saveText: {
    color: "#022c22",
    fontSize: 14,
    fontWeight: "700"
  },
  closeButton: {
    backgroundColor: "#1f2937"
  },
  closeText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700"
  },
  deleteButton: {
    backgroundColor: "#fca5a5"
  },
  deleteText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700"
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  }
});
