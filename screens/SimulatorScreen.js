import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

function simulateOutcome(entryText, mood, action) {
  const text = (entryText || "").toLowerCase();
  const act = (action || "").toLowerCase();

  let base = "Okay";
  if (mood === "Stressed" || mood === "Sad") base = "Calm";
  if (mood === "Happy" || mood === "Calm") base = "Happy";

  let riskScore = 0;
  if (text.includes("fight") || text.includes("argue") || text.includes("overwhelmed")) riskScore += 2;
  if (text.includes("alone") || text.includes("lonely") || text.includes("tired")) riskScore += 1;
  if (text.includes("excited") || text.includes("proud") || text.includes("progress")) riskScore -= 1;

  if (act.includes("confront") || act.includes("quit") || act.includes("snap")) riskScore += 2;
  if (act.includes("talk") || act.includes("rest") || act.includes("plan")) riskScore -= 1;
  if (act.includes("ignore") || act.includes("avoid")) riskScore += 1;

  let predicted = base;
  if (riskScore >= 3) predicted = "Stressed";
  if (riskScore === 2) predicted = "Sad";
  if (riskScore <= 0) predicted = "Happy";

  let advice = "";
  if (predicted === "Happy") advice = "This path looks emotionally supportive. Lean into what helps you feel steady.";
  if (predicted === "Calm") advice = "This choice should lower emotional intensity. Give yourself space and time.";
  if (predicted === "Okay") advice = "This outcome is neutral. Small adjustments could shift it positive.";
  if (predicted === "Sad") advice = "This may leave an emotional dip. Consider a gentler alternative first.";
  if (predicted === "Stressed") advice = "This move could spike stress. Slow down and choose the least reactive option.";

  return { predicted, advice };
}

const moodColor = {
  Happy: "#fcd34d",
  Calm: "#86efac",
  Okay: "#93c5fd",
  Stressed: "#fca5a5",
  Sad: "#c4b5fd"
};

export default function SimulatorScreen({ route }) {
  const entryText = route?.params?.text || "";
  const mood = route?.params?.mood || "Okay";

  const [action, setAction] = useState("");
  const [result, setResult] = useState(null);

  const placeholderIdeas = useMemo(() => {
    if (!entryText) return ["talk it out calmly", "take space and rest", "write a follow-up reflection"];
    if (mood === "Stressed") return ["pause before replying", "go for a walk", "ask for help"];
    if (mood === "Sad") return ["reach out to someone", "do something comforting", "sleep earlier"];
    if (mood === "Happy") return ["celebrate the win", "share the moment", "plan the next step"];
    return ["reflect again tomorrow", "set a small goal", "do a reset routine"];
  }, [entryText, mood]);

  const runSim = () => {
    const sim = simulateOutcome(entryText, mood, action);
    setResult(sim);
  };

  const color = moodColor[mood] || "#93c5fd";

  return (
    <LinearGradient colors={["#050814", "#0b1027"]} style={styles.container}>
      <Text style={styles.title}>What-If Simulator</Text>
      <Text style={styles.subtitle}>
        Helpr uses your reflections to estimate how a choice might feel emotionally.
      </Text>

      <View style={styles.contextCard}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.contextMood}>{mood}</Text>
        </View>
        <Text style={styles.contextText} numberOfLines={4}>
          {entryText || "Pick an entry from ‘Entries’ to simulate a what-if outcome."}
        </Text>
      </View>

      <Text style={styles.label}>If I chose to…</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., confront them honestly / take a break / accept the offer"
        placeholderTextColor="#64748b"
        value={action}
        onChangeText={setAction}
      />

      <View style={styles.ideaRow}>
        {placeholderIdeas.map((idea) => (
          <Pressable key={idea} onPress={() => setAction(idea)} style={styles.ideaChip}>
            <Ionicons name="sparkles" size={12} color="#7dd3fc" />
            <Text style={styles.ideaText}>{idea}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={runSim} style={styles.runWrap} disabled={!action.trim()}>
        <LinearGradient colors={["#7dd3fc", "#a78bfa"]} style={styles.runBtn}>
          <Text style={styles.runText}>Run What-If</Text>
        </LinearGradient>
      </Pressable>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Predicted emotional outcome</Text>
          <Text style={[styles.resultMood, { color: moodColor[result.predicted] || "#e2e8f0" }]}>
            {result.predicted}
          </Text>
          <Text style={styles.resultAdvice}>{result.advice}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 56 },
  title: { color: "#e2e8f0", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 12 },
  contextCard: {
    backgroundColor: "#0a0f23",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#18213a",
    marginBottom: 14
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  contextMood: { color: "#e2e8f0", fontWeight: "800" },
  contextText: { color: "#cbd5e1", fontSize: 14, lineHeight: 19 },
  label: { color: "#e2e8f0", fontSize: 14, fontWeight: "700", marginBottom: 6 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#18213a",
    backgroundColor: "#0a0f23",
    color: "#e2e8f0",
    padding: 12,
    marginBottom: 10
  },
  ideaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  ideaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#18213a",
    backgroundColor: "#050814"
  },
  ideaText: { color: "#e2e8f0", fontSize: 12, fontWeight: "700" },
  runWrap: { marginTop: 4, marginBottom: 12, opacity: 1 },
  runBtn: { paddingVertical: 12, borderRadius: 999, alignItems: "center" },
  runText: { color: "#050814", fontSize: 15, fontWeight: "800" },
  resultCard: {
    backgroundColor: "#0b1120",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#18213a",
    marginTop: 6
  },
  resultTitle: { color: "#e2e8f0", fontSize: 14, fontWeight: "800", marginBottom: 4 },
  resultMood: { fontSize: 20, fontWeight: "900", marginBottom: 6 },
  resultAdvice: { color: "#cbd5e1", fontSize: 14, lineHeight: 20 }
});
