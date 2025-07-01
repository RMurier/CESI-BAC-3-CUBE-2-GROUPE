import { Role } from "./role";

export interface User {
    id: number;
    email: string;
    name?: string | null;
    clerkUserId: string;
    roleId: number;
    role: Role;
    isActivated: boolean;
}