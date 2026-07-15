"use client";

import { EyeIcon, EyeOffIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { type HTMLInputTypeAttribute, useId, useState } from "react";

type InputGroupProps = {
  className?: string;
  label: string;
  placeholder: string;
  type: HTMLInputTypeAttribute;
  fileStyleVariant?: "style1" | "style2";
  required?: boolean;
  disabled?: boolean;
  active?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  height?: "sm" | "default";
  defaultValue?: string;
};

const InputGroup: React.FC<InputGroupProps> = ({
  className,
  label,
  type,
  placeholder,
  required,
  disabled,
  active,
  handleChange,
  icon,
  ...props
}) => {
  const id = useId();
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const iconOnLeft = props.iconPosition === "left";

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-body-sm font-medium text-dark dark:text-white"
      >
        {label}
        {required && <span className="ml-1 select-none text-red">*</span>}
      </label>

      <div className="relative mt-3">
        <input
          id={id}
          type={inputType}
          name={props.name}
          placeholder={placeholder}
          onChange={handleChange}
          value={props.value}
          defaultValue={props.defaultValue}
          className={cn(
            "w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary",
            type === "file"
              ? getFileStyles(props.fileStyleVariant!)
              : "px-5.5 py-3 text-dark placeholder:text-dark-6 dark:text-white",
            iconOnLeft && "pl-12.5",
            (isPassword || (!iconOnLeft && icon)) &&
              type !== "file" &&
              "pr-12.5",
            props.height === "sm" && "py-2.5",
          )}
          required={required}
          disabled={disabled}
          data-active={active}
          autoComplete={isPassword ? "current-password" : undefined}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute top-1/2 right-4.5 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-center text-dark-6 transition hover:text-primary"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : (
          icon && (
            <span
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-dark-6",
                iconOnLeft ? "left-4.5" : "right-4.5",
              )}
            >
              {icon}
            </span>
          )
        )}
      </div>
    </div>
  );
};

export default InputGroup;

function getFileStyles(variant: "style1" | "style2") {
  switch (variant) {
    case "style1":
      return `file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-[#E2E8F0] file:px-6.5 file:py-[13px] file:text-body-sm file:font-medium file:text-dark-5 file:hover:bg-primary file:hover:bg-opacity-10 dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white`;
    default:
      return `file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-stroke file:px-2.5 file:py-1 file:text-body-xs file:font-medium file:text-dark-5 file:focus:border-primary dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white px-3 py-[9px]`;
  }
}
