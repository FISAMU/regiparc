import { Suspense } from "react";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <div>
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-dark dark:text-white">
            Connexion Administrateur
          </h2>
          <p className="text-sm text-dark-5 dark:text-dark-6">
            Connectez-vous avec vos identifiants
          </p>
        </div>
        <SigninWithPassword />
      </div>
    </Suspense>
  );
}

