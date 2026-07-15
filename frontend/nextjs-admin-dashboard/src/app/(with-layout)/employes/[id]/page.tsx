import type { Metadata } from "next";
import Link from "next/link";
import { employesService } from "@/services/employes.service";
import { servicesService } from "@/services/services.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Modifier employé" };

async function updateEmploye(formData: FormData) {
  "use server";
  const id = formData.get("idEmploye") as string;
  const service = (formData.get("service") as string) || "";
  const data = {
    nomEmploye: formData.get("nomEmploye") as string,
    prenomEmploye: formData.get("prenomEmploye") as string,
    Fonction: formData.get("Fonction") as string,
    Email: formData.get("Email") as string,
    service: service || null,
  };

  const { employesService: svc } = await import("@/services/employes.service");
  await svc.update(id, data);
  revalidatePath("/employes");
  redirect("/employes");
}

export default async function ModifierEmployePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employe, services] = await Promise.all([
    employesService.getById(id).catch(() => null),
    servicesService.getAll().catch(() => []),
  ]);

  if (!employe) return <div>Employé non trouvé</div>;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Modifier Employé
        </h1>
        <Link
          href="/employes"
          className="cursor-pointer text-primary transition-colors hover:text-primary/80"
        >
          Retour à la liste
        </Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <form action={updateEmploye} className="p-6.5">
          <input type="hidden" name="idEmploye" value={employe.idEmploye} />
          <div className="mb-4.5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Nom
              </label>
              <input
                type="text"
                name="nomEmploye"
                defaultValue={employe.nomEmploye}
                required
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Prénom
              </label>
              <input
                type="text"
                name="prenomEmploye"
                defaultValue={employe.prenomEmploye}
                required
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Fonction
              </label>
              <input
                type="text"
                name="Fonction"
                defaultValue={employe.Fonction}
                required
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Service
              </label>
              <select
                name="service"
                required
                defaultValue={employe.service ?? ""}
                className="w-full cursor-pointer rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              >
                <option value="">Sélectionner un service</option>
                {services.map((service) => (
                  <option key={service.idService} value={service.idService}>
                    {service.nomService}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Email
              </label>
              <input
                type="email"
                name="Email"
                defaultValue={employe.Email}
                required
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex w-full cursor-pointer justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Mettre à jour l&apos;employé
          </button>
        </form>
      </div>
    </div>
  );
}
