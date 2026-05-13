import { NextResponse } from "next/server";
import type { CustomerAccount } from "@/lib/auth";
import { publicCustomer } from "@/server/customers";
import { readStore, writeStore } from "@/server/store";

type CustomerRouteProps = {
  params: {
    email: string;
  };
};

export async function GET(_request: Request, { params }: CustomerRouteProps) {
  const store = await readStore();
  const email = decodeURIComponent(params.email).toLowerCase();
  const customer = store.customers.find((item) => item.email.toLowerCase() === email);

  if (!customer) {
    return NextResponse.json({ message: "Cliente nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(publicCustomer(customer));
}

export async function PATCH(request: Request, { params }: CustomerRouteProps) {
  const store = await readStore();
  const email = decodeURIComponent(params.email).toLowerCase();
  const data = await request.json() as Partial<CustomerAccount>;
  const customer = store.customers.find((item) => item.email.toLowerCase() === email);

  if (!customer) {
    return NextResponse.json({ message: "Cliente nao encontrado." }, { status: 404 });
  }

  const updatedCustomer: CustomerAccount = {
    ...customer,
    ...data,
    password: data.password || customer.password,
    email: data.email?.toLowerCase() || customer.email
  };

  store.customers = store.customers.map((item) => item.email.toLowerCase() === email ? updatedCustomer : item);
  await writeStore(store);
  return NextResponse.json(publicCustomer(updatedCustomer));
}
