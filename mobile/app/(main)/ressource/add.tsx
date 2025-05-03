import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { RadioButton } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Import de vos services API
import {
  createRessource,
  getCategories,
  getRessourceTypes,
} from "../../../services/api";
import { useUser } from "@clerk/clerk-expo";

interface Category {
  id: number;
  name: string;
}

interface RessourceType {
  id: number;
  name: string;
}

const AddRessourcePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef(null);

  // États pour le formulaire
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [ressourceTypeId, setRessourceTypeId] = useState<number | null>(null);

  // États pour les données
  const [categories, setCategories] = useState<Category[]>([]);
  const [ressourceTypes, setRessourceTypes] = useState<RessourceType[]>([]);

  // Validation d'erreurs
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    categoryId: "",
    ressourceTypeId: "",
  });

  // Charger les catégories et types de ressources
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, typesData] = await Promise.all([
          getCategories(),
          getRessourceTypes(),
        ]);
        setCategories(categoriesData);
        setRessourceTypes(typesData);

        // Définir des valeurs par défaut
        if (categoriesData.length > 0) {
          setCategoryId(categoriesData[0].id);
        }
        if (typesData.length > 0) {
          setRessourceTypeId(typesData[0].id);
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les données nécessaires");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
      categoryId: "",
      ressourceTypeId: "",
    };

    if (!title.trim()) {
      newErrors.title = "Le titre est requis";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "La description est requise";
      isValid = false;
    }

    if (!categoryId) {
      newErrors.categoryId = "Veuillez sélectionner une catégorie";
      isValid = false;
    }

    if (!ressourceTypeId) {
      newErrors.ressourceTypeId = "Veuillez sélectionner un type";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Fermer le clavier avant de soumettre
    Keyboard.dismiss();

    setIsSaving(true);
    try {
      const ressourceData = {
        title,
        description,
        categoryId: categoryId as number,
        ressourceTypeId: ressourceTypeId as number,
        userId: user?.id,
      };

      const result = await createRessource(ressourceData);
      Alert.alert("Succès", "Ressource créée avec succès", [
        { text: "OK", onPress: () => router.push("/ressource") },
      ]);
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible de créer la ressource. Veuillez réessayer."
      );
      console.error("Error creating resource:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009B95" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === "ios"}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle ressource</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre*</Text>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              value={title}
              onChangeText={setTitle}
              placeholder="Entrez le titre de la ressource"
            />
            {errors.title ? (
              <Text style={styles.errorText}>{errors.title}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description*</Text>
            <TextInput
              style={[
                styles.textArea,
                errors.description ? styles.inputError : null,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre ressource"
              multiline
              numberOfLines={4}
            />
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie*</Text>
            <View
              style={[
                styles.pickerContainer,
                errors.categoryId ? styles.inputError : null,
              ]}
            >
              <Picker
                selectedValue={categoryId}
                onValueChange={(itemValue) => setCategoryId(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionnez une catégorie" value={null} />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
            {errors.categoryId ? (
              <Text style={styles.errorText}>{errors.categoryId}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de ressource*</Text>
            <View style={styles.radioGroup}>
              {ressourceTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.radioOption}
                  onPress={() => setRessourceTypeId(type.id)}
                >
                  <RadioButton
                    value={type.id.toString()}
                    status={
                      ressourceTypeId === type.id ? "checked" : "unchecked"
                    }
                    onPress={() => setRessourceTypeId(type.id)}
                    color="#009B95"
                  />
                  <Text style={styles.radioLabel}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.ressourceTypeId ? (
              <Text style={styles.errorText}>{errors.ressourceTypeId}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSaving ? styles.disabledButton : null,
            ]}
            onPress={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Créer la ressource</Text>
            )}
          </TouchableOpacity>

          {/* Espace supplémentaire pour assurer que le bouton est visible */}
          <View style={styles.extraSpace} />
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FA",
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: "#007AFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  radioGroup: {
    flexDirection: "column",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#009B95",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  extraSpace: {
    height: 25, // Espace supplémentaire en bas du formulaire
  },
});

export default AddRessourcePage;
