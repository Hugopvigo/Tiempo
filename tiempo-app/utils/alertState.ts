import type { WeatherAlert } from "@/types/weather";

/**
 * Qué notificar en cada comprobación, sin tocar red ni notificaciones: se
 * compara lo que hay ahora con lo que ya se avisó. Lo usa la tarea en segundo
 * plano; no debe importar componentes.
 */

type Severity = WeatherAlert["severity"];

export interface AlertState {
  key: string;
  /** Ciudad a la que pertenece: el fin de un aviso solo se decide con datos de esa ciudad */
  scope: string;
  source: "aemet" | "local";
  type: WeatherAlert["type"];
  severity: Severity;
  zone?: string;
  endTime: string;
  notifiedAt: number;
}

export type AlertAction =
  | { kind: "new"; alert: WeatherAlert }
  | { kind: "upgraded"; alert: WeatherAlert }
  | { kind: "ended"; state: AlertState }
  // Retirar la notificación sin avisar: el aviso ya no aplica pero no "terminó".
  | { kind: "dismiss"; state: AlertState };

const RANK: Record<Severity, number> = { yellow: 1, orange: 2, red: 3 };
// Una previsión propia no se repite en 24 h salvo que suba de nivel.
const LOCAL_TTL = 24 * 60 * 60 * 1000;
// "Termina el aviso" solo tiene sentido recién caducado.
const ENDED_WINDOW = 2 * 60 * 60 * 1000;

export function alertKey(alert: WeatherAlert): string {
  return alert.key ?? alert.id;
}

export interface PlanInput {
  scope: string;
  /** Avisos vigentes de la ciudad, ya filtrados por los ajustes del usuario */
  alerts: WeatherAlert[];
  /**
   * true si AEMET respondió (aunque fuera sin avisos). Con false no se puede
   * afirmar que un aviso oficial haya terminado.
   */
  aemetOk: boolean;
  now: number;
}

export function planAlertNotifications(
  prev: AlertState[],
  { scope, alerts, aemetOk, now }: PlanInput
): { actions: AlertAction[]; next: AlertState[] } {
  const actions: AlertAction[] = [];
  const others = prev.filter((s) => s.scope !== scope);
  const mine = new Map(prev.filter((s) => s.scope === scope).map((s) => [s.key, s]));
  const next: AlertState[] = [];
  const seen = new Set<string>();

  // Si AEMET no respondió, la previsión propia no debe duplicar un aviso
  // oficial del mismo fenómeno que sigue vigente.
  const officialTypes = new Set(
    [...mine.values()]
      .filter((s) => s.source === "aemet" && new Date(s.endTime).getTime() > now)
      .map((s) => s.type)
  );

  for (const alert of alerts) {
    const source = alert.source ?? "local";
    if (source === "local" && !aemetOk && officialTypes.has(alert.type)) continue;

    const key = alertKey(alert);
    if (seen.has(key)) continue;
    seen.add(key);

    const old = mine.get(key);
    const fresh = old && (source === "aemet" || now - old.notifiedAt < LOCAL_TTL) ? old : undefined;
    const state: AlertState = {
      key, scope, source, type: alert.type, severity: alert.severity,
      zone: alert.zone, endTime: alert.endTime, notifiedAt: fresh?.notifiedAt ?? now,
    };

    if (!fresh) {
      actions.push({ kind: "new", alert });
      state.notifiedAt = now;
    } else if (RANK[alert.severity] > RANK[fresh.severity]) {
      actions.push({ kind: source === "aemet" ? "upgraded" : "new", alert });
      state.notifiedAt = now;
    } else if (RANK[alert.severity] < RANK[fresh.severity]) {
      // Baja de nivel: no se avisa, y se recuerda el nivel más alto ya
      // notificado para que un vaivén amarillo-naranja no repita el aviso.
      state.severity = fresh.severity;
    }
    next.push(state);
  }

  for (const state of mine.values()) {
    if (seen.has(state.key)) continue;
    const sinceEnd = now - new Date(state.endTime).getTime();
    if (state.source === "aemet") {
      // Que el aviso no esté en la lista no significa que haya terminado: puede
      // haberse desactivado ese tipo en ajustes, cambiado la ciudad de zona o
      // retirado AEMET el aviso. Solo se anuncia el fin cuando su hora de fin
      // acaba de pasar; en los demás casos se retira la notificación en silencio.
      if (sinceEnd >= 0 && sinceEnd <= ENDED_WINDOW && aemetOk) actions.push({ kind: "ended", state });
      else if (aemetOk || sinceEnd > ENDED_WINDOW) actions.push({ kind: "dismiss", state });
      else next.push(state);
    } else if (now - state.notifiedAt < LOCAL_TTL) {
      // Se conserva para no volver a avisar si el umbral se cruza otra vez hoy.
      next.push(state);
    }
  }

  return { actions, next: [...others, ...next] };
}

/** Descarta el estado de ciudades que ya no se comprueban. */
export function pruneAlertStates(states: AlertState[], scopes: string[], now: number): AlertState[] {
  const active = new Set(scopes);
  return states.filter(
    (s) => active.has(s.scope) || new Date(s.endTime).getTime() > now - LOCAL_TTL
  );
}
