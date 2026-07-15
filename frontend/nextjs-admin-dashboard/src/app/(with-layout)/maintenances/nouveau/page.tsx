import type { Metadata } from "next";
import Link from "next/link";
import { equipementsService } from "@/services/equipements.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Nouvelle maintenance" };

async function createMaintenance(formData: FormData) {
  "use server";
  const data = {
    equipement: formData.get("equipement") as string,
    dateMaintenance: formData.get("dateMaintenance") as string,
    typeMaintenance: formData.get("typeMaintenance") as string,
    Description: formData.get("Description") as string,
    Cout: formData.get("Cout") as string,
    devise: formData.get("devise") as "CDF" | "USD",
  };

  const { maintenancesService: svc } = await import("@/services/maintenances.service");
  await svc.create(data);
  revalidatePath("/maintenances");
  redirect("/maintenances");
}

export default async function NouvelleMaintenancePage() {
  const equipements = await equipementsService.getAll().catch(() => []);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Nouvelle Maintenance</h1>
        <Link href="/maintenances" className="text-primary hover:text-primary/80 transition-colors">Retour à la liste</Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-2xl mx-auto">
        <form action={createMaintenance} className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Équipement</label>
              <select name="equipement" required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input">
                <option value="">Sélectionner un équipement</option>
                {equipements.map((e) => (
                  <option key={e.idEquipement} value={e.idEquipement}>{e.codeInventaire} - {e.Designation}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Date de Maintenance</label>
              <input type="date" name="dateMaintenance" required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Type de Maintenance</label>
              <input type="text" name="typeMaintenance" required placeholder="Ex: Préventive, Curative..." className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Description</label>
              <textarea name="Description" required rows={3} className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input"></textarea>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">Coût</label>
                <input type="number" step="0.01" name="Cout" required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
              </div>
              <div>
                <label className="mb-2.5 block font-medium text-black dark:text-white">Devise</label>
                <select name="devise" required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input">
                  <option value="USD">USD ($)</option>
                  <option value="CDF">CDF (Franc congolais)</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit" className="flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90">Créer la maintenance</button>
        </form>
      </div>
    </div>
  );
}
