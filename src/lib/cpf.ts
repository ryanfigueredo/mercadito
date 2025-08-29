export function stripCpfNonDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

export function isValidCPF(raw: string): boolean {
  const cpf = stripCpfNonDigits(raw);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // disallow all same digits

  const calcCheckDigit = (base: string, factorStart: number): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) {
      sum += Number(base[i]) * (factorStart - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const firstNine = cpf.slice(0, 9);
  const d1 = calcCheckDigit(firstNine, 10);
  const d2 = calcCheckDigit(firstNine + String(d1), 11);

  return cpf.endsWith(`${d1}${d2}`);
}
