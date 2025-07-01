import { CommentEntity } from "./comment";
import { RessourceEntity } from "./ressources";

export type UserEntity = {
  id: number;
  clerkUserId: string;
  email: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
  comments?: CommentEntity[];
  ressources?: RessourceEntity[];
};
