import { CategoryEntity } from "./category";

export type RessourceEntity = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
  isActive: boolean;
  categoryId: number;
  category: CategoryEntity;
  ressourceTypeId: number;
  ressourceType: RessourceTypeEntity;
  userId: number | string;
  user: UserEntity;
};

export type RessourceTypeEntity = {
  id: number;
  name: string;
  isActive: boolean;
  ressources: RessourceEntity[];
};

export interface RessourceCreateBody {
  title: string;
  description: string;
  categoryId: number;
  ressourceTypeId: number;
}

export interface RessourceTypeCreateBody {
  name: string;
}
