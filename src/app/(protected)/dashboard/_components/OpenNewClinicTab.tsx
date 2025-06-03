"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function OpenNewClinicTab() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("open") === "new-clinic") {
      // Chame aqui a função que abre a aba/modal de criar clínica
      // Exemplo: window.dispatchEvent(new Event("open-new-clinic"))
    }
  }, [searchParams]);

  return null;
}
