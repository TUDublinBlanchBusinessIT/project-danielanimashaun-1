import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import NewEntryScreen from "./screens/NewEntryScreen";
import EntriesScreen from "./screens/EntriesScreen";
import SimulatorScreen from "./screens/SimulatorScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#4F46E5",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: { backgroundColor: "#fff", height: 70, paddingBottom: 10 },
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: "home",
              NewEntry: "create",
              Entries: "book",
              Simulator: "help-circle"
            };
            return <Ionicons name={icons[route.name]} color={color} size={26} />;
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="NewEntry" component={NewEntryScreen} />
        <Tab.Screen name="Entries" component={EntriesScreen} />
        <Tab.Screen name="Simulator" component={SimulatorScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
