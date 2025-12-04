import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import NewEntryScreen from "./screens/NewEntryScreen";
import EntriesScreen from "./screens/EntriesScreen";

const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#050814"
  }
};

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0a0f23",
            borderTopColor: "#151a33",
            height: 64,
            paddingBottom: 8,
            paddingTop: 6
          },
          tabBarActiveTintColor: "#7dd3fc",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarIcon: ({ color, size }) => {
            let icon = "ellipse";
            if (route.name === "Home") icon = "sparkles";
            if (route.name === "New Entry") icon = "add-circle";
            if (route.name === "Entries") icon = "book";
            return <Ionicons name={icon} size={size} color={color} />;
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600"
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="New Entry" component={NewEntryScreen} />
        <Tab.Screen name="Entries" component={EntriesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
