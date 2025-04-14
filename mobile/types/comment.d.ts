import { RessourceEntity } from "./ressources";
import { UserEntity } from "./user";

export type CommentEntity = {
  id: number;
  content: string;
  publishedAt: Date;
  authorId: number;
  author?: UserEntity;
  ressourceId: number;
  ressource?: RessourceEntity;
};

export type CommentCreateBody = {
  content: string;
  authorId: number;
};
