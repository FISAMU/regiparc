import type { Metadata } from "next";
import Link from "next/link";
import { equipementsService } from "@/services/equipements.service";
import { categoriesService } from "@/services/categories.service";
import { employesService } from "@/services/employes.service";
import { servicesService } from "@/services/services.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EQUIPMENT_ETATS, normalizeEquipmentEtat } from "@/lib/equipment-etat";

export const metadata: Metadata = { title: "Modifier équipement" };

async function updateEquipement(formData: FormData) {
  "use server";
  const id = formData.get("idEquipement") as string;
  const data = {
    codeInventaire: formData.get("codeInventaire") as string,
    Designation: formData.get("Designation") as string,
    Marque: formData.get("Marque") as string,
    Modele: formData.get("Modele") as string,
    numSerie: formData.get("numSerie") as string,
    dateAcquisition: formData.get("dateAcquisition") as string,
    valeur: formData.get("valeur") as string,
    Etat: formData.get("Etat") as string,
    categorie: formData.get("categorie") as string,
    service: formData.get("service") as string,
    employe: (formData.get("employe") as string) || null,
  };

  const { equipementsService: svc } = await import("@/services/equipements.service");
  await svc.update(id, data);
  revalidatePath("/equipements");
  redirect("/equipements");
}

export default async function ModifierEquipementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [equipement, categories, employes, services] = await Promise.all([
    equipementsService.getById(id),
    categoriesService.getAll().catch(() => []),
    employesService.getAll().catch(() => []),
    servicesService.getAll().catch(() => []),
  ]);

  if (!equipement) return <div>Équipement non trouvé</div>;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Modifier Équipement</h1>
        <Link href="/equipements" className="text-primary hover:text-primary/80 transition-colors">Retour à la liste</Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <form action={updateEquipement} className="p-6.5">
          <input type="hidden" name="idEquipement" value={equipement.idEquipement} />
          <div className="mb-4.5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Code Inventaire</label>
              <input type="text" name="codeInventaire" defaultValue={equipement.codeInventaire} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Désignation</label>
              <input type="text" name="Designation" defaultValue={equipement.Designation} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Marque</label>
              <input type="text" name="Marque" defaultValue={equipement.Marque} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Modèle</label>
              <input type="text" name="Modele" defaultValue={equipement.Modele} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Numéro de Série</label>
              <input type="text" name="numSerie" defaultValue={equipement.numSerie} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Date d'Acquisition</label>
              <input type="date" name="dateAcquisition" defaultValue={equipement.dateAcquisition} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Valeur</label>
              <input type="number" step="0.01" name="valeur" defaultValue={equipement.valeur} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">État</label>
              <select name="Etat" defaultValue={normalizeEquipmentEtat(equipement.Etat)} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input">
                {EQUIPMENT_ETATS.map((etat) => (
                  <option key={etat} value={etat}>{etat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Catégorie</label>
              <select name="categorie" defaultValue={equipement.categorie} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input">
                <option value="">Sélectionner une catégorie</option>
                {categories.map((c) => (
                  <option key={c.idCategorie} value={c.idCategorie}>{c.nomCategorie}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Service</label>
              <select name="service" defaultValue={equipement.service} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input">
                <option value="">Sélectionner un service</option>
                {services.map((s) => (
                  <option key={s.idService} value={s.idService}>{s.nomService}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Employé (Optionnel)</label>
              <select name="employe" defaultValue={equipement.employe || ""} className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input">
                <option value="">Aucun employé assigné</option>
                {employes.map((e) => (
                  <option key={e.idEmploye} value={e.idEmploye}>{e.nomEmploye} {e.prenomEmploye}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90">Mettre à jour l'équipement</button>
        </form>
      </div>
    </div>
  );
}
