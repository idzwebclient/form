"use client";

import Image from "next/image";
import Link from "next/link";
import { FORM_REGISTRY, type FormId } from "./registry";

export default function FormTopbar({
  currentFormId,
  onClear,
}: {
  currentFormId: FormId;
  onClear: () => void;
}) {
  const currentForm = FORM_REGISTRY.find((form) => form.id === currentFormId) ?? FORM_REGISTRY[0];

  return (
    <header className="topbar no-print">
      <div className="topbar-navigation">
        <div className="brand-lockup">
          <Image
            className="brand-logo"
            src="/brand/qudani-wordmark-white.png"
            alt="Qudani Jewels"
            width={4958}
            height={879}
            priority
          />
          <h1 className="visually-hidden">{currentForm.title}</h1>
          <span className="brand-divider" aria-hidden="true" />
        </div>
        <div className="form-menu-block">
          <span className="form-menu-label">Menu borang</span>
          <nav className="form-menu" aria-label={`Menu borang. Borang semasa: ${currentForm.title}`}>
            {FORM_REGISTRY.map((form) => (
              <Link
                className={form.id === currentFormId ? "form-menu-item active" : "form-menu-item"}
                href={form.href}
                aria-current={form.id === currentFormId ? "page" : undefined}
                key={form.id}
              >
                {form.menuLabel}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="topbar-actions">
        <span className="save-status">Draft disimpan di peranti ini</span>
        <span className="topbar-action-divider" aria-hidden="true" />
        <button className="button button-ghost" type="button" onClick={onClear}>
          Kosongkan
        </button>
        <button className="button button-primary" type="button" onClick={() => window.print()}>
          Cetak / Simpan PDF
        </button>
      </div>
    </header>
  );
}
