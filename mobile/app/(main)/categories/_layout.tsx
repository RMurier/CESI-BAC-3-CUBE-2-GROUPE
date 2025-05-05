import { Stack } from "expo-router";

export default function CategoriesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[name]"
        options={({ route }) => {
          const name = route?.params?.name as string;
          return {
            title: `Catégorie : ${name}`,
          };
        }}
      />
    </Stack>
  );
}
