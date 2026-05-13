import { NextResponse } from "next/server";
import type { CustomerAccount } from "@/lib/auth";
import { publicCustomer, publicCustomers } from "@/server/customers";
import { readStore, writeStore } from "@/server/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(publicCustomers(store.customers));
}

export async function POST(request: Request) {
  const store = await readStore();
  const data = await request.json() as Omit<CustomerAccount, "createdAt"> & { createdAt?: string };
  const email = data.email.trim().toLowerCase();
  const existing = store.customers.find((customer) => customer.email.toLowerCase() === email);

  if (existing && data.password) {
    return NextResponse.json({ message: "Ja existe um cadastro com este e-mail." }, { status: 409 });
  }

  if (data.password !== undefined && data.password.length < 5) {
    return NextResponse.json({ message: "A senha precisa ter pelo menos 5 caracteres." }, { status: 400 });
  }

  const customer: CustomerAccount = {
    name: data.name,
    email,
    password: data.password || existing?.password || "",
    phone: data.phone,
    address: data.address,
    createdAt: existing?.createdAt || data.createdAt || new Date().toISOString()
  };

  store.customers = [customer, ...store.customers.filter((item) => item.email.toLowerCase() !== email)];
  await writeStore(store);
  return NextResponse.json(publicCustomer(customer), { status: existing ? 200 : 201 });
}
