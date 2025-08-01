"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


interface User {
  id: string;
  name: string;
  email: string;
  is_sys_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ /me response:", data);
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          is_sys_admin: data.user.is_sys_admin
        });
        setPermissions(data.permissions);
      } else {
        setUser(null);
        setPermissions([]);
      }
    } catch (err) {
      console.error("Failed to fetch /me:", err);
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch("http://localhost:8000/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setPermissions([]);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login"); // Or wherever your login page is
    }
  }, [isLoading, user, router]);


  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      <>
        {children}
        {isLoading && (
          <div className="fixed bottom-4 right-4 bg-gray-700 text-white px-4 py-2 rounded shadow-lg text-sm">
            Refreshing user...
          </div>
        )}
      </>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
