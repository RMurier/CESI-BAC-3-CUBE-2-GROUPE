import { create } from "zustand";

interface RoleState {
  isAdmin: boolean | null;
  isSuperAdmin: boolean | null;
  setRoles: (admin: boolean | null, superAdmin: boolean | null) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  isAdmin: false,
  isSuperAdmin: false,
  setRoles: (admin, superAdmin) => set({ isAdmin: admin, isSuperAdmin: superAdmin }),
}));
