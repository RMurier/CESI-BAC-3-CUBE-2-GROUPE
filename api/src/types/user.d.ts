export type UserEntity = {
  id: number;
  clerkUserId: string;
  email: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
  Comment?: Comment[];
};
