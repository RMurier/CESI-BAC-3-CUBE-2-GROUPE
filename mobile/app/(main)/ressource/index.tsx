import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  GestureResponderEvent,
  Animated,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  RessourceEntity,
  RessourceTypeEntity,
} from "../../../types/ressources";
import { CategoryEntity } from "../../../types/category";
import { useApiWithAuth } from "../../../services/api";

export default function ResourcesScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  const [resources, setResources] = useState<RessourceEntity[]>([]);
  const [filteredResources, setFilteredResources] = useState<RessourceEntity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<
    RessourceTypeEntity | undefined
  >(undefined);
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryEntity | undefined
  >(undefined);
  const [availableTypes, setAvailableTypes] = useState<RessourceTypeEntity[]>(
    []
  );
  const [availableCategories, setAvailableCategories] = useState<
    CategoryEntity[]
  >([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filtersHeight] = useState(new Animated.Value(0));
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  // Fonction pour supprimer les doublons basés sur le nom
  const removeDuplicatesByName = <T extends { name: string }>(
    items: T[]
  ): T[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const normalizedName = item.name.toLowerCase().trim();
      if (seen.has(normalizedName)) {
        return false;
      }
      seen.add(normalizedName);
      return true;
    });
  };
  const { getCategories, getRessources, getRessourceTypes } = useApiWithAuth();

  useEffect(() => {
    if (isSignedIn) {
      Promise.all([fetchResources(), fetchResourceTypes(), fetchCategories()]);
    }
  }, [isSignedIn]);

  // Filter resources whenever search criteria changes
  useEffect(() => {
    console.log("useEffect.resources");

    if (resources) {
      filterResources();
    }
    let count = 0;
    if (searchText) count++;
    if (selectedType) count++;
    if (selectedCategory) count++;
    setActiveFiltersCount(count);
  }, [searchText, selectedType, selectedCategory, resources]);

  useEffect(() => {
    if (filtersVisible) {
      Animated.timing(filtersHeight, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(filtersHeight, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [filtersVisible]);

  const fetchResources = async () => {
    try {
      setLoading(true);

      let response;

      const resourcesList = await getRessources();

      setResources(resourcesList);
      setFilteredResources(resourcesList);
      console.log("resources ", resources);

      setError("");
    } catch (err) {
      setError(
        "Impossible de charger les ressources. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceTypes = async () => {
    try {
      setTypesLoading(true);

      const result = await getRessourceTypes();

      // Supprimer les doublons basés sur le nom
      const uniqueTypes = removeDuplicatesByName(result || []);
      setAvailableTypes(uniqueTypes);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des types de ressources:",
        err
      );

      const types = [
        ...new Set(resources.map((item) => item.ressourceType).filter(Boolean)),
      ];
      const uniqueTypes = removeDuplicatesByName(types);
      setAvailableTypes(uniqueTypes);
    } finally {
      setTypesLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const result = await getCategories();

      // Supprimer les doublons basés sur le nom
      const uniqueCategories = removeDuplicatesByName(result || []);
      setAvailableCategories(uniqueCategories);
    } catch (err) {
      console.error("Erreur lors de la récupération des catégories:", err);
      // Fallback to extracting from resources if API call fails
      const categories = [
        ...new Set(resources.map((item) => item.category).filter(Boolean)),
      ];
      const uniqueCategories = removeDuplicatesByName(categories);
      setAvailableCategories(uniqueCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const navigateToAddResource = () => {
    router.push("/ressource/add");
  };

  const filterResources = () => {
    console.log("filtering category...");
    console.log("selectedCategory", selectedCategory);

    if (resources) {
      let results = [...resources];
      console.log("results", results);
      if (results) {
        // Filter by search text (resource name/title)
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          results = results.filter(
            (item) =>
              (item.title && item.title.toLowerCase().includes(searchLower)) ||
              (item.description &&
                item.description.toLowerCase().includes(searchLower))
          );
        }

        // Filter by resource type
        if (selectedType) {
          results = results.filter(
            (item) => item.ressourceTypeId === selectedType.id
          );
        }

        // Filter by category
        if (selectedCategory) {
          console.log("ok");

          results = results.filter(
            (item) => item.categoryId === selectedCategory.id
          );
        }
        setFilteredResources(results);
      }
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedType(undefined);
    setSelectedCategory(undefined);
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderFilterChip = (
    id: string,
    label: string,
    isSelected: boolean,
    onPress: (event: GestureResponderEvent) => void
  ) => (
    <TouchableOpacity
      key={id}
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          isSelected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>Catégories:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderFilterChip(
          "all-categories",
          "Tous",
          selectedCategory?.name === "",
          () => setSelectedCategory(undefined)
        )}

        {availableCategories.map((category) =>
          renderFilterChip(
            `category-${category.id}`,
            category.name,
            selectedCategory?.id === category.id,
            () => {
              setSelectedCategory(
                selectedCategory?.id === category.id ? undefined : category
              );
              filterResources();
            }
          )
        )}
      </ScrollView>
    </View>
  );

  const renderTypeFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>Types:</Text>
      <View style={styles.chipContainer}>
        {renderFilterChip("all-types", "Tous", !selectedType, () =>
          setSelectedType(undefined)
        )}

        {availableTypes.map((type) =>
          renderFilterChip(
            `type-${type.id}`,
            type.name,
            selectedType?.id === type.id,
            () =>
              setSelectedType(selectedType?.id === type.id ? undefined : type)
          )
        )}
      </View>
    </View>
  );

  type Props = {
    item: RessourceEntity;
  };
  const renderItem = ({ item }: Props) => {
    const getTypeIcon = () => {
      switch (item.ressourceType.name?.toLowerCase()) {
        case "public":
          return "🌐";
        case "privé":
          return "🔒";
        default:
          return "📄";
      }
    };

    return (
      <TouchableOpacity
        style={styles.resourceItem}
        onPress={() =>
          router.push({
            pathname: "/ressource/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.resourceHeader}>
          <Text style={styles.resourceTitle}>{item.title}</Text>
          {item.isActive && <View style={styles.activeIndicator} />}
        </View>
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.resourceMeta}>
          {item.category && (
            <Text style={styles.resourceMetaText}>
              Catégorie: {item.category.name}
            </Text>
          )}
        </View>
        <View style={styles.resourceFooter}>
          <Text style={styles.resourceDate}>
            Créé le: {formatDate(item.createdAt.toString())}
          </Text>

          {/* Affichage du type avec icône en bas à droite */}
          {item.ressourceType && (
            <View style={styles.typeContainer}>
              <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
              <Text style={styles.typeText}>{item.ressourceType.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Veuillez vous connecter pour accéder aux ressources
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ressources</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
            <Ionicons name="options-outline" size={22} color="#0066cc" />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={async () => {
              setLoading(true);

              try {
                const ressources = await getRessources();
                if (ressources) {
                  setResources(ressources);
                }
                console.log(1);
                fetchResourceTypes();
                fetchCategories();
              } catch (e) {
                console.log(e);
                setError(
                  "Impossible de charger les ressources. Veuillez réessayer plus tard."
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            <Ionicons name="refresh-outline" size={22} color="#0066cc" />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.View
        style={[
          styles.filtersContainer,
          {
            maxHeight: filtersHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 500],
            }),
            opacity: filtersHeight,
          },
        ]}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom..."
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText || selectedType || selectedCategory ? (
            <TouchableOpacity onPress={clearFilters}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filtersLayout}>{renderTypeFilter()}</View>
        <View style={styles.filtersLayout}>{renderCategoryFilter()}</View>
      </Animated.View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loaderText}>Chargement des ressources...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={fetchResources}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filteredResources.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {resources.length === 0
              ? "Aucune ressource disponible"
              : "Aucune ressource ne correspond à vos critères de recherche"}
          </Text>
          {resources.length > 0 && (
            <TouchableOpacity style={styles.button} onPress={clearFilters}>
              <Text style={styles.buttonText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToAddResource}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12, // Increased from 8
    marginBottom: 16, // Increased from 12
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterSection: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10, // Increased from 6
    color: "#666",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8, // Increased from 6
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
    marginBottom: 10, // Increased from 8
  },
  filterChipSelected: {
    backgroundColor: "#0066cc",
  },
  filterChipText: {
    fontSize: 14,
    color: "#333",
  },
  filterChipTextSelected: {
    color: "white",
  },
  listContainer: {
    paddingBottom: 20,
  },
  resourceItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  resourceMeta: {
    // flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  resourceMetaText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  resourceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resourceDate: {
    fontSize: 12,
    color: "#999",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  button: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  filterBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#f44336",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    padding: 8,
    position: "relative",
  },
  miniLoader: {
    marginHorizontal: 10,
  },
  filtersLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  chipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },

  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#009B95", // Couleur turquoise assortie à votre thème
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Pour Android
    shadowColor: "#000", // Pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 100,
  },
  // chipContainer: {
  //   flexDirection: "row",
  //   flexWrap: "wrap",
  //   marginTop: 8,
  // },
});
