import type { CustomerAccount } from "@/lib/auth";

export function publicCustomer(customer: CustomerAccount): CustomerAccount {
  const { password: _password, ...safeCustomer } = customer;
  return safeCustomer;
}

export function publicCustomers(customers: CustomerAccount[]) {
  return customers.map(publicCustomer);
}
