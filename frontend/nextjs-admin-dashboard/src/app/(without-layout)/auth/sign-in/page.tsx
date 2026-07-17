import Signin from "@/components/Auth/Signin";
import BackgroundSlider from "@/components/Auth/BackgroundSlider";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="w-full xl:w-1/2 flex items-center justify-center min-h-screen">
        <div className="mx-auto w-[570px] p-4 sm:p-12.5 xl:p-15">
          <Signin />
        </div>
      </div>

      <div className="hidden w-full xl:block xl:w-1/2 relative min-h-screen overflow-hidden">
        {/* Images d'équipements informatiques en arrière-plan (défilement) */}
        <BackgroundSlider />
        
        {/* Dégradé bleu au-dessus de l'image */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e2a38] via-[#2d3e50] to-[#445d7b] opacity-90"></div>
        
        {/* Contenu au-dessus du dégradé */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          {/* Logo regideso en blanc */}
          <div className="mb-12 -mt-20">
            <Image
              src={"/logo-regideso.png"}
              alt="Regideso Logo"
              width={220}
              height={55}
              className="brightness-0 invert"
            />
          </div>
          
          {/* Texte de bienvenue */}
          <div className="text-center text-white max-w-lg">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
              Bienvenue sur RegiParc
            </h1>
            <p className="text-lg font-medium leading-relaxed text-blue-50">
              Votre plateforme centralisée pour la gestion, le suivi et la maintenance de l'ensemble du parc informatique et réseau de la Regideso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
