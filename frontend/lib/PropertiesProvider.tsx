"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { Property } from "@/lib/types";

interface Ctx {
  properties: Property[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const PropertiesContext = createContext<Ctx>({ properties: [], loading: true, refresh: async () => {} });

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const rows = await api.listProperties();
      setProperties(rows);
    } catch (e) {
      console.error("Failed to load properties:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: any org member's insert/update/delete refreshes the shared cache
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("properties-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => refresh())
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, [refresh]);

  return (
    <PropertiesContext.Provider value={{ properties, loading, refresh }}>{children}</PropertiesContext.Provider>
  );
}

export function useProperties() {
  return useContext(PropertiesContext);
}