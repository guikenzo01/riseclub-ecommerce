import { NextResponse } from "next/server";
import { publicCustomer } from "@/server/customers";
import { readStore } from "@/server/store";

export async function POST(request: Request) {
  const { email, password } = await request.json() as { email?: string; password?: string };
  const normalizedEmail = email?.trim().toLowerCase() || "";
  const store = await readStore();
  const customer = store.customers.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!customer) {
    return NextResponse.json({ message: "Conta nao encontrada." }, { status: 404 });
  }

  if (!customer.password) {
    return NextResponse.json({ message: "Esta conta ainda nao tem senha. Atualize seu cadastro." }, { status: 409 });
  }

  if (customer.password !== password) {
    return NextResponse.json({ message: "E-mail ou senha invalidos." }, { status: 401 });
  }

  return NextResponse.json(publicCustomer(customer));
}
