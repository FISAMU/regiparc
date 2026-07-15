import type { Metadata } from "next";
import Link from "next/link";
import { equipementsService } from "@/services/equipements.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Nouvelle affectation" };

async function createAffectation(formData: FormData) {
  "use server";
  const dateRetour = formData.get("dateRetour") as string;
  const data = {
    equipement: formData.get("equipement") as string,
    dateAffectation: formData.get("dateAffectation") as string,
    dateRetour: dateRetour || null,
  };

  const { affectationsService: svc } = await import("@/services/affectations.service");
  await svc.create(data);
  revalidatePath("/affectations");
  redirect("/affectations");
}

export default async function NouvelleAffectationPage() {
  const equipements = await equipementsService.getAll().catch(() => []);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Nouvelle Affectation</h1>
        <Link href="/affectations" className="text-primary hover:text-primary/80 transition-colors">Retour à la liste</Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-2xl mx-auto">
        <form action={createAffectation} className="p-6.5">
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
              <label className="mb-2.5 block font-medium text-black dark:text-white">Date d'Affectation</label>
              <input type="date" name="dateAffectation" required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Date de Retour (Optionnel)</label>
              <input type="date" name="dateRetour" className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
          </div>
          <button type="submit" className="flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90">Créer l'affectation</button>
        </form>
      </div>
    </div>
  );
}
