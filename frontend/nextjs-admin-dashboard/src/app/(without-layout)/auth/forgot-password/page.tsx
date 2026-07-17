import ForgotPasswordForm from "./_components/forgot-password-form";
import BackgroundSlider from "@/components/Auth/BackgroundSlider";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="flex min-h-screen w-full items-center justify-center xl:w-1/2">
        <div className="mx-auto w-[570px] p-4 sm:p-12.5 xl:p-15">
          <ForgotPasswordForm />
        </div>
      </div>

      <div className="relative hidden min-h-screen w-full overflow-hidden xl:block xl:w-1/2">
        <BackgroundSlider />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e2a38] via-[#2d3e50] to-[#445d7b] opacity-90" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-6">
          <div className="-mt-20 mb-12">
            <Image
              src={"/logo-regideso.png"}
              alt="Regideso Logo"
              width={220}
              height={55}
              className="brightness-0 invert"
            />
          </div>
          <div className="max-w-lg text-center text-white">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
              Réinitialisation sécurisée
            </h1>
            <p className="text-lg font-medium leading-relaxed text-blue-50">
              Un code de vérification sera envoyé à votre adresse email
              administrateur pour confirmer le changement de mot de passe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
