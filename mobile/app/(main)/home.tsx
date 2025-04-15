import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useAuth, useUser } from "@clerk/clerk-expo";

const HomeScreen = () => {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const { signOut } = useAuth();
  const { user } = useUser();
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const CategoryCard = ({
    title,
    description,
    iconName,
    route,
  }: {
    title: string;
    description: string;
    iconName: string;
    route: string;
  }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigateTo(route)}
    >
      <View style={styles.categoryIconContainer}>
        {/* Ici vous pourriez utiliser une icône spécifique */}
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>{iconName}</Text>
        </View>
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categoryDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, animatedStyle]}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            La plateforme pour améliorer vos relations
          </Text>
        </Animated.View>

        <Animated.View style={[styles.welcomeSection, animatedStyle]}>
          <Text style={styles.welcomeTitle}>Bienvenue {user?.username}</Text>
          <Text style={styles.welcomeText}>
            Découvrez des ressources et outils pour créer, renforcer et enrichir
            vos relations personnelles et professionnelles.
          </Text>
        </Animated.View>

        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>

          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => navigateTo("/ressource")}
            >
              <Text style={styles.quickButtonText}>Liste des ressources</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => navigateTo("/ressource/add")}
            >
              <Text style={styles.quickButtonText}>Créer une ressource</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Explorer par catégorie</Text>

          <CategoryCard
            title="Relations familiales"
            description="Renforcez vos liens avec vos proches"
            iconName="👪"
            route="/categories/family"
          />

          <CategoryCard
            title="Relations de couple"
            description="Enrichissez votre vie à deux"
            iconName="❤️"
            route="/categories/couple"
          />

          <CategoryCard
            title="Amitiés"
            description="Cultivez des amitiés sincères et durables"
            iconName="🤝"
            route="/categories/friends"
          />

          <CategoryCard
            title="Relations professionnelles"
            description="Améliorez vos interactions au travail"
            iconName="💼"
            route="/categories/work"
          />
        </View>

        <TouchableOpacity
          style={styles.discoverButton}
          onPress={() => signOut()}
        >
          <Text style={styles.discoverButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FA",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  logo: {
    width: width * 0.7,
    height: 100,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  welcomeSection: {
    backgroundColor: "#009B95",
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "white",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  categoriesSection: {
    marginBottom: 25,
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    marginRight: 15,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFEFD5",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
  },
  quickAccessSection: {
    marginBottom: 30,
  },
  quickButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickButton: {
    flex: 1,
    backgroundColor: "#F0B45C",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: "#009B95",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  discoverButton: {
    backgroundColor: "#e32c22",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  discoverButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HomeScreen;
