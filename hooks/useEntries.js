import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export function useEntries(limitCount) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let q = query(collection(db, "entries"), orderBy("timestamp", "desc"));
    if (limitCount && limitCount > 0) {
      q = query(collection(db, "entries"), orderBy("timestamp", "desc"), limit(limitCount));
    }

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
  }, [limitCount]);

  return entries;
}
