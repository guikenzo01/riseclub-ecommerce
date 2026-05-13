import { NextResponse } from "next/server";
import { publicCustomer } from "@/server/customers";
import { readStore, writeStore } from "@/server/store";

export async function POST(request: Request) {
  const { email, phone, password } = await request.json() as {
    email?: string;
    phone?: string;
    password?: string;
  };
  const normalizedEmail = email?.trim().toLowerCase() || "";
  const normalizedPhone = phone?.replace(/\D/g, "") || "";

  if (!password || password.length < 5) {
    return NextResponse.json({ message: "A nova senha precisa ter pelo menos 5 caracteres." }, { status: 400 });
  }

  const store = await readStore();
  const customer = store.customers.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!customer) {
    return NextResponse.json({ message: "Conta nao encontrada." }, { status: 404 });
  }

  const customerPhone = customer.phone.replace(/\D/g, "");
  if (!normalizedPhone || customerPhone !== normalizedPhone) {
    return NextResponse.json({ message: "WhatsApp nao confere com o cadastro." }, { status: 401 });
  }

  const updatedCustomer = {
    ...customer,
    password
  };

  store.customers = store.customers.map((item) =>
    item.email.toLowerCase() === normalizedEmail ? updatedCustomer : item
  );
  await writeStore(store);

  return NextResponse.json(publicCustomer(updatedCustomer));
}
