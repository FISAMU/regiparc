"use client";

/**
 * Formulaire de connexion RegiParc.
 * Token Django → storage + cookie auth_token ; option « Se souvenir de moi ».
 */
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";

export default function SigninWithPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rememberedEmail = authService.getRememberedEmail();
    const remember = authService.wasRememberMeEnabled();
    if (rememberedEmail || remember) {
      setData((current) => ({
        ...current,
        email: rememberedEmail || current.email,
        remember,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const callbackURL = searchParams.get("callbackUrl") || "/";

      const result = await authService.login({
        email: data.email,
        password: data.password,
      });

      authService.saveSession(result, data.remember);

      router.push(callbackURL);
      router.refresh();
      toast.success("Connexion réussie !");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Échec de la connexion";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-3.75"
        placeholder="Votre email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Mot de passe"
        className="mb-5 [&_input]:py-3.75"
        placeholder="Votre mot de passe"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
        <Checkbox
          label="Se souvenir de moi"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          checked={data.remember}
          onChange={(e) =>
            setData({
              ...data,
              remember: e.target.checked,
            })
          }
        />

        <Link
          href="/auth/forgot-password"
          className="ring-primary outline-0 hover:text-primary focus-visible:text-primary focus-visible:ring dark:text-white dark:hover:text-primary"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="hover:bg-opacity-90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Connexion en cours..." : "Se connecter"}
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
