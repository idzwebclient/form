"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import FormTopbar from "../FormTopbar";
import { ADVANCE_FORM_CONFIG } from "./config";
import { displayDate, money, moneyValue } from "./formatters";
import type { AdvanceFormState } from "./types";

const initialState: AdvanceFormState = {
  name: "",
  nric: "",
  branch: "",
  date: "",
  amount: "",
  reason: "",
  approvedBy: "",
};

function readSavedState(): AdvanceFormState | null {
  try {
    const saved = localStorage.getItem(ADVANCE_FORM_CONFIG.storageKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<AdvanceFormState>;
    return {
      ...initialState,
      ...parsed,
      amount: moneyValue(parsed.amount ?? ""),
    };
  } catch {
    return null;
  }
}

export default function AdvanceForm() {
  const [form, setForm] = useState<AdvanceFormState>(initialState);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readSavedState();
      if (saved) setForm(saved);
      setDraftLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (draftLoaded) {
      localStorage.setItem(ADVANCE_FORM_CONFIG.storageKey, JSON.stringify(form));
    }
  }, [form, draftLoaded]);

  const clearForm = () => setForm(initialState);

  return (
    <main className="app-shell advance-app">
      <FormTopbar currentFormId={ADVANCE_FORM_CONFIG.id} onClear={clearForm} />

      <section className="workspace advance-workspace no-print">
        <aside className="editor-panel advance-editor-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">Maklumat borang</span>
              <h2>Butiran pekerja</h2>
            </div>
            <span className="page-count">1 halaman</span>
          </div>

          <div className="form-grid advance-employee-fields">
            <label>
              Nama
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Nama pekerja"
              />
            </label>
            <label>
              No. NRIC
              <input
                value={form.nric}
                onChange={(event) => setForm({ ...form, nric: event.target.value })}
                placeholder="Nombor kad pengenalan"
              />
            </label>
            <label>
              Cawangan
              <input
                value={form.branch}
                onChange={(event) => setForm({ ...form, branch: event.target.value })}
                placeholder="Nama cawangan"
              />
            </label>
            <label>
              Tarikh
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>
          </div>

          <section className="advance-request-editor">
            <div>
              <span className="step-label">Permohonan advance</span>
              <h2>Jumlah dan sebab</h2>
            </div>
            <label className="advance-amount-field">
              Amount of Advance
              <input
                inputMode="decimal"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                onBlur={(event) => setForm((current) => ({ ...current, amount: moneyValue(event.target.value) }))}
                placeholder="Amaun"
              />
            </label>
            <label>
              Reason for Advance
              <textarea
                rows={4}
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
                placeholder="Sebab permohonan"
              />
            </label>
          </section>

          <section className="advance-approval-editor">
            <div>
              <span className="step-label">Kelulusan</span>
              <h2>Maklumat pelulus</h2>
            </div>
            <label>
              Approve by &amp; Name
              <input
                value={form.approvedBy}
                onChange={(event) => setForm({ ...form, approvedBy: event.target.value })}
                placeholder="Nama pelulus"
              />
            </label>
            <p>Ruang tandatangan pekerja dan pelulus dibiarkan kosong untuk ditandatangani selepas dicetak.</p>
          </section>
        </aside>

        <section className="preview-panel advance-preview-panel">
          <div className="preview-toolbar">
            <div>
              <span className="step-label">Pratonton langsung</span>
              <h2>Halaman 1</h2>
            </div>
            <span>A4 potret</span>
          </div>
          <div className="preview-scroll advance-preview-scroll">
            <AdvancePage form={form} preview />
          </div>
        </section>
      </section>

      <section className="print-document" aria-label="Dokumen advance untuk dicetak">
        <AdvancePage form={form} />
      </section>
    </main>
  );
}

function AdvancePage({ form, preview = false }: {
  form: AdvanceFormState;
  preview?: boolean;
}) {
  return (
    <article className={preview ? "paper advance-paper advance-paper-preview" : "paper advance-paper"}>
      <Image
        className="advance-document-logo"
        src={ADVANCE_FORM_CONFIG.assets.documentLogo}
        alt="Qudani Jewels"
        width={4500}
        height={4500}
        priority
      />

      <h2 className="advance-document-title">SALARY/COMMISION ADVANCE FORM</h2>

      <section className="advance-document-details">
        <h3>EMPLOYEE DETAILS</h3>
        <div className="advance-detail-rows">
          <div><span>Name</span><strong>:</strong><i>{form.name}</i></div>
          <div><span>NRIC No</span><strong>:</strong><i>{form.nric}</i></div>
          <div><span>Branch</span><strong>:</strong><i>{form.branch}</i></div>
          <div><span>Date</span><strong>:</strong><i>{displayDate(form.date)}</i></div>
        </div>
      </section>

      <section className="advance-document-request">
        <div className="advance-document-amount">
          {form.amount ? money(form.amount) : "RM"}
        </div>
        <div className="advance-document-reason">
          <span>Reason for Advance :</span>
          <i>{form.reason}</i>
        </div>
      </section>

      <p className="advance-declaration">
        I apply for the above mentioned salary/commision and authorised Qudani Jewels to deduct
        the loan repayment from my Salary/Commision as follows
      </p>

      <section className="advance-signatures">
        <div><i /><span>Employee Signature &amp; Date</span></div>
        <div><i>{form.approvedBy}</i><span>Approve by &amp; Name</span></div>
      </section>
    </article>
  );
}
