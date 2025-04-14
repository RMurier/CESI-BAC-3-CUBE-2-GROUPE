import { RessourceEntity } from "./ressources";
import { UserEntity } from "./user";

export type CommentEntity = {
  id: string;
  content: string;
  publishedAt: Date;
  authorId: number | string;
  author?: UserEntity;
  ressourceId: number;
  ressource?: RessourceEntity;
};
