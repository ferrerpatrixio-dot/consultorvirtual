"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Script from "next/script";
import { AlertCircle } from "lucide-react";
import { crearSuscripcionAction } from "./actions";

// Captura de tarjeta con CardForm (MercadoPago.js V2) — decisión ya cerrada,
// ver docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md sección 5 (no Checkout
// Bricks: no hay confirmación oficial de que su token sirva para
// /preapproval, y pierde compatibilidad con "cuentas de prueba"). Los `id`
// del formulario son fijos — MercadoPago.js los busca por nombre, ver
// docs/referencia/MERCADO-PAGO.md sección 3.2.

type CardFormData = {
  token: string;
};

type CardFormInstance = {
  getCardFormData: () => CardFormData;
  unmount: () => void;
};

type MercadoPagoInstance = {
  cardForm: (config: Record<string, unknown>) => CardFormInstance;
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string) => MercadoPagoInstance;
  }
}

const CAMPO =
  "h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition focus-within:border-primary";

export function SuscripcionForm({ publicKey }: { publicKey: string }) {
  const [sdkListo, setSdkListo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cardFormRef = useRef<CardFormInstance | null>(null);

  useEffect(() => {
    if (!sdkListo || !window.MercadoPago) return;

    const mp = new window.MercadoPago(publicKey);
    const cardForm = mp.cardForm({
      amount: "19900",
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número de tarjeta" },
        expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/YY" },
        securityCode: { id: "form-checkout__securityCode", placeholder: "Código de seguridad" },
        cardholderName: { id: "form-checkout__cardholderName", placeholder: "Titular de la tarjeta" },
        issuer: { id: "form-checkout__issuer", placeholder: "Banco emisor" },
        installments: { id: "form-checkout__installments", placeholder: "Cuotas" },
        identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
        identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número de documento" },
        cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "Email del titular" },
      },
      callbacks: {
        onFormMounted: (formError: unknown) => {
          if (formError) {
            setError("No se pudo cargar el formulario de pago. Recarga la página.");
          }
        },
        onSubmit: (event: SubmitEvent) => {
          event.preventDefault();
          setError(null);

          const { token } = cardForm.getCardFormData();
          if (!token) {
            setError("No se pudo generar el token de la tarjeta. Revisa los datos e intenta de nuevo.");
            return;
          }

          startTransition(async () => {
            const resultado = await crearSuscripcionAction(token);
            if (resultado?.error) setError(resultado.error);
          });
        },
      },
    });

    cardFormRef.current = cardForm;
    return () => cardFormRef.current?.unmount();
  }, [sdkListo, publicKey]);

  return (
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" onReady={() => setSdkListo(true)} />

      <form id="form-checkout" className="mt-6 space-y-3">
        <div id="form-checkout__cardNumber" className={CAMPO} />

        <div className="grid grid-cols-2 gap-3">
          <div id="form-checkout__expirationDate" className={CAMPO} />
          <div id="form-checkout__securityCode" className={CAMPO} />
        </div>

        <input
          id="form-checkout__cardholderName"
          placeholder="Titular de la tarjeta"
          className={`${CAMPO} w-full`}
        />

        <div className="grid grid-cols-[auto_1fr] gap-3">
          <select id="form-checkout__identificationType" className={CAMPO} />
          <input
            id="form-checkout__identificationNumber"
            placeholder="Número de documento"
            className={CAMPO}
          />
        </div>

        <input
          id="form-checkout__cardholderEmail"
          type="email"
          placeholder="Email del titular de la tarjeta"
          className={`${CAMPO} w-full`}
        />

        {/* issuer/installments: campos que CardForm gestiona internamente
            (banco emisor y cuotas — fijo en 1 para suscripción). Se dejan
            visibles porque ocultarlos puede romper el llenado automático
            que hace el SDK al detectar el tipo de tarjeta. */}
        <select id="form-checkout__issuer" className={`${CAMPO} w-full`} />
        <select id="form-checkout__installments" className={`${CAMPO} w-full`} />

        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <button
          type="submit"
          id="form-checkout__submit"
          disabled={!sdkListo || pending}
          className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Procesando…" : "Suscribirme — CLP $19.900/mes"}
        </button>
      </form>
    </>
  );
}
