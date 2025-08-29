import { MercadoPagoConfig, Preference } from "mercadopago";

export function getPreferenceClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente no .env");

  const client = new MercadoPagoConfig({ accessToken: token });
  return new Preference(client);
}
