import { Address, Customer } from "./orders";

export type CustomerAccount = Customer & {
  address: Address;
  createdAt: string;
  password?: string;
};

const ACCOUNT_KEY = "riseclub-account";
const ADMIN_SESSION_KEY = "riseclub-admin-session";

export const adminCredentials = {
  email: "admin@riseclub.com",
  password: "rise123"
};

export type AdminSession = {
  email: string;
  name: string;
  role: "admin";
  createdAt: string;
};

export function readAccount(): CustomerAccount | null {
  if (typeof window === "undefined") return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAccount(account: CustomerAccount) {
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  window.dispatchEvent(new Event("riseclub-account-updated"));
}

export function clearAccount() {
  window.localStorage.removeItem(ACCOUNT_KEY);
  window.dispatchEvent(new Event("riseclub-account-updated"));
}

export function createAccount(data: Omit<CustomerAccount, "createdAt">) {
  const account: CustomerAccount = {
    ...data,
    createdAt: new Date().toISOString()
  };
  saveAccount(account);
  return account;
}

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ADMIN_SESSION_KEY) || "null");
    return parsed?.role === "admin" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("riseclub-admin-session-updated"));
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  window.dispatchEvent(new Event("riseclub-admin-session-updated"));
}

export function validateAdminLogin(email: string, password: string) {
  return (
    email.trim().toLowerCase() === adminCredentials.email &&
    password === adminCredentials.password
  );
}
