import { createContext, useContext } from "react";
import type { CommerceContext } from "./types";
export const StoreContext = createContext<CommerceContext | null>(null);
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("StoreContext ausente");
  return context;
}
