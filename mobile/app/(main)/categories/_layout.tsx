import { Stack } from "expo-router";

export default function CategoriesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[name]"
        options={({ route }) => {
          return {
            title: `Catégorie : ${route?.params?.name as string}`,
          };
        }}
      />
    </Stack>
  );
}
