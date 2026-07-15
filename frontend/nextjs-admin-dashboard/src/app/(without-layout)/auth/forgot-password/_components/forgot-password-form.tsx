"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import InputGroup from "@/components/FormElements/InputGroup";

type Step = "email" | "code" | "password";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequestCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.requestPasswordReset(email.trim());
      toast.success(result.message);
      setStep("code");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Impossible d'envoyer le code.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.verifyPasswordResetCode(
        email.trim(),
        code.trim(),
      );
      toast.success(result.message);
      setStep("password");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Code invalide ou expiré.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.confirmPasswordReset(
        email.trim(),
        code.trim(),
        password,
      );
      toast.success(result.message);
      router.push("/auth/sign-in");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de modifier le mot de passe.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-dark dark:text-white">
          Mot de passe oublié
        </h2>
        <p className="text-sm text-dark-5 dark:text-dark-6">
          {step === "email" &&
            "Saisissez votre email pour recevoir un code de vérification."}
          {step === "code" &&
            "Entrez le code à 6 chiffres reçu dans votre boîte mail."}
          {step === "password" && "Choisissez votre nouveau mot de passe."}
        </p>
      </div>

      {step === "email" && (
        <form onSubmit={handleRequestCode}>
          <InputGroup
            type="email"
            label="Email"
            className="mb-5 [&_input]:py-3.75"
            placeholder="Votre email administrateur"
            name="email"
            value={email}
            handleChange={(e) => setEmail(e.target.value)}
            icon={<EmailIcon />}
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Envoi..." : "Envoyer le code"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerifyCode}>
          <InputGroup
            type="text"
            label="Code de vérification"
            className="mb-5 [&_input]:py-3.75"
            placeholder="Ex. 482193"
            name="code"
            value={code}
            handleChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
          <button
            type="submit"
            disabled={loading || code.trim().length !== 6}
            className="mb-3 flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Vérification..." : "Vérifier le code"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
            className="w-full cursor-pointer text-sm text-primary hover:underline"
          >
            Modifier l&apos;email / renvoyer un code
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleConfirmPassword}>
          <InputGroup
            type="password"
            label="Nouveau mot de passe"
            className="mb-4 [&_input]:py-3.75"
            placeholder="Minimum 8 caractères"
            name="password"
            value={password}
            handleChange={(e) => setPassword(e.target.value)}
            icon={<PasswordIcon />}
          />
          <InputGroup
            type="password"
            label="Confirmer le mot de passe"
            className="mb-5 [&_input]:py-3.75"
            placeholder="Retapez le mot de passe"
            name="confirmPassword"
            value={confirmPassword}
            handleChange={(e) => setConfirmPassword(e.target.value)}
            icon={<PasswordIcon />}
          />
          <button
            type="submit"
            disabled={loading || password.length < 8}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Enregistrement..." : "Modifier le mot de passe"}
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <p className="mt-6 text-center text-sm">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
