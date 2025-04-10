import { useEffect, useState } from "react";
import { Role } from "../interfaces/role";
import { User } from "../interfaces/user";

export const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users`);
        const data = await res.json();
        setUsers(data);
        setLoading(false);
    };

    const fetchRoles = async () => {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/roles`);
        const data = await res.json();
        setRoles(data);
    };


    const updateUserRole = async (userId: number, newRoleId: number) => {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/role/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleId: newRoleId }),
        });

        if (!res.ok) {
            console.error("Échec de mise à jour");
            return;
        }

        setUsers((prevUsers) =>
            prevUsers.map((u) => {
                if (u.id !== userId) return u;

                const updatedUser: User = {
                    ...u,
                    roleId: newRoleId,
                    role: roles.find((r) => r.id === newRoleId)!,
                };

                return updatedUser;
            })
        );
    };

    const deleteUser = async (userId: number) => {
        await fetch(`${import.meta.env.VITE_BASE_URL}/users/${userId}`, {
            method: "DELETE",
        });
        fetchUsers();
    };

    const activateUser = async (userId: number, isActivated: boolean) => {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/desactivate/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActivated }),
        });

        if (!res.ok) {
            console.error("Erreur lors de la désactivation de l'utilisateur.");
            return;
        }

        setUsers((prev) =>
            prev.map((u) =>
                u.id === userId ? { ...u, isActivated } : u
            )
        );
    };


    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Chargement des utilisateurs...</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Utilisateurs</h1>
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-left text-sm text-gray-600">
                    <tr>
                        <th className="p-3">Id</th>
                        <th className="p-3">Nom</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t text-sm">
                            <td className="p-3">{user.id ?? "—"}</td>
                            <td className="p-3">{user.name ?? "—"}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">
                                <select
                                    value={user.roleId}
                                    onChange={(e) => updateUserRole(user.id, Number(e.target.value))}
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-3 text-center space-x-4">
                                <button
                                    onClick={() => activateUser(user.id, !user.isActivated)}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    {user.isActivated ? "Désactiver" : "Activer"}
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
