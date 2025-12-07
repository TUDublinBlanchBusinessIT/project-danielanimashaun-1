import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

function computeOutcome(currentMood, actionText) {
  const text = actionText.toLowerCase();

  const positiveWords = [
    "talk",
    "listen",
    "explain",
    "apologise",
    "apologize",
    "hug",
    "rest",
    "sleep",
    "journal",
    "walk",
    "breathe",
    "meditate",
    "forgive",
    "support",
    "help",
    "calm"
  ];

  const negativeWords = [
    "argue",
    "shout",
    "yell",
    "block",
    "ghost",
    "ignore",
    "quit",
    "slam",
    "insult",
    "fight",
    "snap",
    "scream",
    "cut off",
    "storm out"
  ];

  const bigChangeWords = [
    "move",
    "relocate",
    "break up",
    "resign",
    "quit job",
    "change career",
    "drop out",
    "confront",
    "buy a car",
    "buy a house"
  ];

  let sentimentScore = 0;

  positiveWords.forEach(w => {
    if (text.includes(w)) sentimentScore += 1;
  });

  negativeWords.forEach(w => {
    if (text.includes(w)) sentimentScore -= 1;
  });

  let changeScore = 0;
  bigChangeWords.forEach(w => {
    if (text.includes(w)) changeScore += 1;
  });

  const moodWeight = {
    Happy: 1,
    Calm: 0.5,
    Okay: 0,
    Stressed: -1,
    Sad: -1
  };

  const baseMood = currentMood || "Okay";
  const moodInfluence = moodWeight[baseMood] ?? 0;

  const totalScore = sentimentScore + changeScore * -0.5 + moodInfluence;

  let resultMood = "Okay";
  let advice =
    "This choice looks balanced. Check if it matches how you want to treat yourself and others.";

  if (totalScore >= 2) {
    resultMood = "Hopeful";
    advice =
      "This path looks likely to leave you feeling lighter and more supported. Keep your boundaries clear and communicate honestly.";
  } else if (totalScore >= 1) {
    resultMood = "Calmer";
    advice =
      "This seems like a gentle, constructive step. It may reduce pressure if you stay patient and clear about what you need.";
  } else if (totalScore <= -2) {
    resultMood = "Regretful";
    advice =
      "This option may lead to tension or regret. Slowing down and choosing a softer action could protect you emotionally.";
  } else if (totalScore <= -1) {
    resultMood = "Tense";
    advice =
      "There is a risk that this will increase conflict or emotional distance. See if there is a way to stay firm without exploding.";
  } else {
    if (changeScore > 0) {
      resultMood = "Unsure";
      advice =
        "This is a big change. Your feelings may swing between excitement and fear at first. Planning and support can make it easier.";
    }
  }

  if ((baseMood === "Stressed" || baseMood === "Sad") && totalScore < 1) {
    advice +=
      " Because you already feel heavy, choosing the most caring and least aggressive option is likely to help you more.";
  }

  if (baseMood === "Happy" && sentimentScore < 0) {
    advice += " You are in a good place now. Be sure this choice will not damage the calm you already have.";
  }

  return { resultMood, advice };
}

export default function SimulatorScreen() {
  const route = useRoute();
  const entryText = route?.params?.text || "";
  const entryMood = route?.params?.mood || "Not set";

  const [action, setAction] = useState("");
  const [outcome, setOutcome] = useState(null);

  function handleRun() {
    if (!action.trim()) {
      setOutcome({
        resultMood: "No preview",
        advice: "Write the action you are thinking about so Helpr can give you a rough emotional outlook."
      });
      return;
    }
    const result = computeOutcome(entryMood, action);
    setOutcome(result);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>What-if simulator</Text>
      <Text style={styles.subtitle}>
        This screen gives a rough emotional preview based on your last reflection and the action you are considering.
      </Text>

      <View style={styles.box}>
        <Text style={styles.label}>Current mood</Text>
        <Text style={styles.value}>{entryMood}</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>Recent reflection</Text>
        <Text style={styles.entryText}>
          {entryText || "Open the simulator from a saved reflection to see a more personal result."}
        </Text>
      </View>

      <Text style={styles.label}>If I chose to...</Text>
      <TextInput
        value={action}
        onChangeText={setAction}
        placeholder="Example: talk calmly and explain how I feel"
        placeholderTextColor="#64748b"
        style={styles.input}
        multiline
      />

      <TouchableOpacity onPress={handleRun} style={styles.button}>
        <Text style={styles.buttonText}>Run what-if</Text>
      </TouchableOpacity>

      {outcome && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Predicted emotional outcome</Text>
          <Text style={styles.resultMood}>{outcome.resultMood}</Text>
          <Text style={styles.resultAdvice}>{outcome.advice}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40, backgroundColor: "#020617" },
  title: { fontSize: 22, fontWeight: "700", color: "#e5e7eb", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#9ca3af", marginBottom: 16 },
  box: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16
  },
  label: { fontSize: 13, fontWeight: "600", color: "#e5e7eb" },
  value: { fontSize: 16, fontWeight: "700", color: "#7dd3fc", marginTop: 2 },
  entryText: { fontSize: 13, color: "#cbd5e1", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#020617",
    color: "#e5e7eb",
    marginTop: 6,
    marginBottom: 14,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 13
  },
  button: {
    backgroundColor: "#7dd3fc",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 16
  },
  buttonText: { color: "#020617", fontSize: 15, fontWeight: "700" },
  resultBox: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  resultLabel: { fontSize: 13, fontWeight: "600", color: "#e5e7eb", marginBottom: 4 },
  resultMood: { fontSize: 18, fontWeight: "700", color: "#a855f7", marginBottom: 4 },
  resultAdvice: { fontSize: 13, color: "#cbd5e1", lineHeight: 20 }
});
