export function formatMaintenanceCost(
  amount: string | number,
  devise: "CDF" | "USD" = "USD",
) {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return `${amount} ${devise}`;
  }

  if (devise === "CDF") {
    return `${value.toLocaleString("fr-FR")} FC`;
  }

  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
