import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function SimulatorScreen({ route }) {
  const entryText = route?.params?.text || "";
  const entryMood = route?.params?.mood || "Not set";

  const [action, setAction] = useState("");
  const [outcome, setOutcome] = useState(null);

  function runSimulator() {
    if (!action.trim()) {
      setOutcome({
        result: "No prediction",
        advice: "Describe the action you are considering so Helpr can react to it."
      });
      return;
    }

    const text = action.toLowerCase();

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
      "confront"
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

    const baseMood = entryMood || "Okay";
    const moodInfluence = moodWeight[baseMood] ?? 0;

    const totalScore = sentimentScore + changeScore * -0.5 + moodInfluence;

    let result = "Mixed";
    let advice = "This choice may lead to mixed emotions. It could help to check what you really want from the situation.";

    if (totalScore >= 2) {
      result = "Hopeful";
      advice = "This path looks likely to leave you feeling lighter and more supported, especially if you stay honest and kind.";
    } else if (totalScore >= 1) {
      result = "Calmer";
      advice = "This option seems constructive and could reduce pressure if you communicate clearly.";
    } else if (totalScore <= -2) {
      result = "Regretful";
      advice = "This may lead to more stress or regret. Pausing before acting could protect you from reacting on impulse.";
    } else if (totalScore <= -1) {
      result = "Tense";
      advice = "This could increase conflict or emotional distance. Is there a softer way to protect your boundaries?";
    } else if (changeScore > 0) {
      result = "Unsure";
      advice = "This is a big change. It is normal to feel a mix of fear and excitement. Planning and support can make it easier.";
    }

    if ((baseMood === "Stressed" || baseMood === "Sad") && totalScore < 1) {
      advice += " Because you already feel low, choosing the least aggressive option may help you feel safer afterwards.";
    }

    setOutcome({ result, advice });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>What-if simulator</Text>
      <Text style={styles.subtitle}>
        Helpr gives a rough emotional preview based on your current mood and the action you are thinking about.
      </Text>

      <View style={styles.box}>
        <Text style={styles.label}>Current mood</Text>
        <Text style={styles.mood}>{entryMood}</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>Latest reflection</Text>
        <Text style={styles.entryText}>
          {entryText || "Open the simulator after writing a reflection for a more personalised prediction, or type freely below."}
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

      <TouchableOpacity style={styles.button} onPress={runSimulator}>
        <Text style={styles.buttonText}>Run what-if</Text>
      </TouchableOpacity>

      {outcome && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Predicted emotional outcome</Text>
          <Text style={styles.resultMood}>{outcome.result}</Text>
          <Text style={styles.resultAdvice}>{outcome.advice}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", paddingHorizontal: 18, paddingTop: 40 },
  title: { color: "#e5e7eb", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#9ca3af", fontSize: 13, marginBottom: 16, lineHeight: 18 },
  box: {
    backgroundColor: "#0b1023",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#151a33",
    marginBottom: 18
  },
  label: { color: "#e5e7eb", fontSize: 13, fontWeight: "600" },
  mood: { color: "#7dd3fc", fontSize: 18, fontWeight: "800", marginTop: 4 },
  entryText: { color: "#cbd5e1", fontSize: 13, marginTop: 4, lineHeight: 18 },
  input: {
    backgroundColor: "#050816",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2933",
    padding: 12,
    color: "#e5e7eb",
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 6,
    marginBottom: 14
  },
  button: {
    backgroundColor: "#7dd3fc",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 18
  },
  buttonText: { color: "#050814", fontSize: 15, fontWeight: "800" },
  resultBox: {
    backgroundColor: "#050816",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2933",
    padding: 14
  },
  resultLabel: { color: "#e5e7eb", fontSize: 13, fontWeight: "600", marginBottom: 4 },
  resultMood: { color: "#a855f7", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  resultAdvice: { color: "#cbd5e1", fontSize: 13, lineHeight: 20 }
});
