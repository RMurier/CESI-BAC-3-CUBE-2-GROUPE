import { RessourceEntity } from "./ressources";

export type CategoryEntity = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  ressources?: RessourceEntity[];
};

export interface CategoryCreateBody {
  name: string;
  description: string;
}
