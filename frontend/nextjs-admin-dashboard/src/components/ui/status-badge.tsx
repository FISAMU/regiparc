import { cn } from "@/lib/utils";
import {
  normalizeEquipmentEtat,
  type EquipmentEtat,
} from "@/lib/equipment-etat";

type StatusStyles = {
  badge: string;
  button: string;
  dot: string;
  ping: string;
};

const ETAT_STYLES: Record<EquipmentEtat, StatusStyles> = {
  "En marche": {
    badge: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    button: "border-green-500 bg-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.55)]",
    dot: "bg-green-500",
    ping: "bg-green-400",
  },
  "En avertissement": {
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
    button: "border-amber-500 bg-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.55)]",
    dot: "bg-amber-500",
    ping: "bg-amber-400",
  },
  "En panne": {
    badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    button: "border-red-500 bg-red-500/25 shadow-[0_0_8px_rgba(239,68,68,0.55)]",
    dot: "bg-red-500",
    ping: "bg-red-400",
  },
};

const CONNECTION_STYLES = {
  online: {
    badge: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    button: "border-green-500 bg-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.55)]",
    dot: "bg-green-500",
    ping: "bg-green-400",
  },
  offline: {
    badge: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    button: "border-slate-400 bg-slate-400/20 shadow-[0_0_6px_rgba(100,116,139,0.45)]",
    dot: "bg-slate-500",
    ping: "bg-slate-400",
  },
};

export function EquipmentStatusBadge({ etat }: { etat: string }) {
  const normalized = normalizeEquipmentEtat(etat);
  const styles = ETAT_STYLES[normalized];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm font-medium",
        styles.badge,
      )}
    >
      <span>{normalized}</span>
      <BlinkingStatusButton styles={styles} />
    </span>
  );
}

export function ConnectionStatusBadge({ isOnline }: { isOnline: boolean }) {
  const styles = isOnline ? CONNECTION_STYLES.online : CONNECTION_STYLES.offline;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm font-medium",
        styles.badge,
      )}
    >
      <span>{isOnline ? "En ligne" : "Hors ligne"}</span>
      <BlinkingStatusButton styles={styles} active={isOnline} />
    </span>
  );
}

function BlinkingStatusButton({
  styles,
  active = true,
}: {
  styles: StatusStyles;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
        styles.button,
      )}
      aria-hidden="true"
    >
      {active && (
        <span
          className={cn(
            "absolute inset-0 animate-ping rounded-md opacity-70",
            styles.ping,
          )}
        />
      )}
      <span
        className={cn(
          "relative size-2.5 rounded-sm",
          active ? cn("animate-pulse", styles.dot) : styles.dot,
        )}
      />
    </span>
  );
}
