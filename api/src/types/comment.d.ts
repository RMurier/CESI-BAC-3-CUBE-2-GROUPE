export type CommentEntity = {
  id: number;
  content: string;
  publishedAt: Date;
  authorId: number;
  author?: User;
};
