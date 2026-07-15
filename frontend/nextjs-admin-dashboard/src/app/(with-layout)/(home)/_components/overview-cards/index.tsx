import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const {
    equipements,
    employes,
    maintenances,
    services,
    affectations,
    categories,
  } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-6 2xl:gap-7.5">
      <OverviewCard
        label="Équipements"
        data={{
          ...equipements,
          value: compactFormat(equipements.value),
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Employés"
        data={{
          ...employes,
          value: compactFormat(employes.value),
        }}
        Icon={icons.Users}
      />

      <OverviewCard
        label="Maintenances"
        data={{
          ...maintenances,
          value: compactFormat(maintenances.value),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Services"
        data={{
          ...services,
          value: compactFormat(services.value),
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Affectations"
        data={{
          ...affectations,
          value: compactFormat(affectations.value),
        }}
        Icon={icons.Affectation}
      />

      <OverviewCard
        label="Catégories"
        data={{
          ...categories,
          value: compactFormat(categories.value),
        }}
        Icon={icons.Category}
      />
    </div>
  );
}

