import type { Metadata } from "next";
import Link from "next/link";
import { servicesService } from "@/services/services.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Modifier service" };

async function updateService(formData: FormData) {
  "use server";
  const id = formData.get("idService") as string;
  const data = {
    nomService: formData.get("nomService") as string,
    Localisation: formData.get("Localisation") as string,
  };

  const { servicesService: svc } = await import("@/services/services.service");
  await svc.update(id, data);
  revalidatePath("/services");
  redirect("/services");
}

export default async function ModifierServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await servicesService.getById(id).catch(() => null);

  if (!service) return <div>Service non trouvé</div>;

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Modifier Service</h1>
        <Link href="/services" className="text-primary hover:text-primary/80 transition-colors">Retour à la liste</Link>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-2xl mx-auto">
        <form action={updateService} className="p-6.5">
          <input type="hidden" name="idService" value={service.idService} />
          <div className="mb-4.5 flex flex-col gap-6">
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Nom du service</label>
              <input type="text" name="nomService" defaultValue={service.nomService} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
            <div>
              <label className="mb-2.5 block font-medium text-black dark:text-white">Localisation</label>
              <input type="text" name="Localisation" defaultValue={service.Localisation} required className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white dark:bg-form-input" />
            </div>
          </div>
          <button type="submit" className="flex w-full justify-center rounded-lg bg-primary p-3 font-medium text-gray hover:bg-opacity-90">Mettre à jour le service</button>
        </form>
      </div>
    </div>
  );
}
