import { RessourceEntity } from "./ressources";

export type CategoryEntity = {
  id: number;
  name: string;
  description: string;
  ressources?: RessourceEntity[];
};
