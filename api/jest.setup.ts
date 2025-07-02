jest.mock("@clerk/express", () => ({
  requireAuth: () => (req: any, res: any, next: any) => {
    req.auth = { userId: "test-user-id" };
    next();
  },
  clerkClient: {
    users: {
      getUser: jest.fn().mockResolvedValue({ id: "test-user-id", email: "test@test.com" }),
    },
  },
}));
