import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft, Navigation, Trash2, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SavedDirection {
  id: number;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  created_at: string;
}

export default function SavedDirections() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [directions, setDirections] = useState<SavedDirection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDirections = async () => {
    try {
      const profileRaw = await AsyncStorage.getItem("@campus_profile");
      if (!profileRaw) {
        setErrorMsg("Please log in to view saved routes.");
        return;
      }
      
      const profile = JSON.parse(profileRaw);
      const userId = profile.id;
      if (!userId) {
        setErrorMsg("User ID not found. Please log in again.");
        return;
      }

      const res = await api.getSavedDirections(userId);
      setDirections(res.directions || []);
      setErrorMsg(null);
    } catch (err: any) {
      console.log("Fetch Directions Error:", err);
      setErrorMsg("Failed to load saved routes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDirections();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDirections();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Route",
      "Are you sure you want to delete this saved route?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteDirection(id);
              setDirections((prev) => prev.filter((d) => d.id !== id));
            } catch (err) {
              console.log("Delete error", err);
              Alert.alert("Error", "Failed to delete route.");
            }
          },
        },
      ]
    );
  };

  const handleNavigate = (route: SavedDirection) => {
    // Navigate back to home and pass deep link parameters
    const from = JSON.stringify({
      name: route.origin_name,
      coordinate: { latitude: route.origin_lat, longitude: route.origin_lng },
    });
    
    const to = JSON.stringify({
      name: route.destination_name,
      coordinate: { latitude: route.destination_lat, longitude: route.destination_lng },
    });

    router.push({
      pathname: "/home",
      params: { from, to },
    });
  };

  const renderItem = ({ item }: { item: SavedDirection }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
        onPress={() => handleNavigate(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.routeContainer}>
            <View style={styles.iconColumn}>
              <View style={[styles.dot, { backgroundColor: theme.primary }]} />
              <View style={[styles.line, { backgroundColor: theme.border }]} />
              <MapPin size={16} color={theme.primary} />
            </View>
            <View style={styles.textColumn}>
              <Text style={[styles.originText, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.origin_name}
              </Text>
              <Text style={[styles.destText, { color: theme.text }]} numberOfLines={1}>
                {item.destination_name}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Saved Routes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>{errorMsg}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            onPress={fetchDirections}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={directions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBg, { backgroundColor: theme.surfaceAlt }]}>
                <Navigation size={40} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No saved routes</Text>
              <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                When you save a route on the map, it will appear here for quick access.
              </Text>
              <TouchableOpacity
                style={[styles.exploreBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.replace("/home")}
              >
                <Text style={styles.exploreBtnText}>Explore Map</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  iconColumn: {
    alignItems: "center",
    marginRight: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    height: 20,
    marginVertical: 4,
  },
  textColumn: {
    flex: 1,
    paddingRight: 12,
    gap: 16,
  },
  originText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  destText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  deleteBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: "80%",
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
