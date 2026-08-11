"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import FormTopbar from "../FormTopbar";
import { BRANCH_PURCHASE_CONFIG, PERSON_TERM_TITLE } from "./config";
import {
  actualValue,
  goldValue,
  money,
  moneyLines,
  moneyValue,
  numberValue,
  sumMoneyLines,
  weight,
} from "./formatters";
import type { Customer, FormState, Item, OtherCost } from "./types";

const newId = () => Math.random().toString(36).slice(2, 10);

const newItem = (): Item => ({ id: newId(), gold: "", weight: "", actual: "" });

const newCustomer = (): Customer => ({
  id: newId(),
  name: "",
  items: [newItem()],
  cost: "",
  purchase: "",
});

const initialState: FormState = {
  branch: "ALOR SETAR",
  date: "",
  index: "350 / 400",
  capital: "",
  otherCosts: [{ id: "other-cost-1", detail: "", amount: "" }],
  customers: [{
    id: "customer-1",
    name: "",
    items: [{ id: "item-1", gold: "", weight: "", actual: "" }],
    cost: "",
    purchase: "",
  }],
};

const PERSON_TERM = BRANCH_PURCHASE_CONFIG.personTerm;

function readSavedState(): FormState | null {
  try {
    const saved = localStorage.getItem(BRANCH_PURCHASE_CONFIG.storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Omit<FormState, "otherCosts"> & {
        otherCosts?: OtherCost[] | string;
      };
      if (parsed.customers?.length) {
        const otherCosts = normalizeOtherCosts(parsed.otherCosts).map((item) => ({
          ...item,
          amount: moneyValue(item.amount),
        }));
        return {
          ...initialState,
          ...parsed,
          capital: moneyValue(parsed.capital ?? ""),
          otherCosts,
          customers: parsed.customers.map((customer) => ({
            ...customer,
            cost: moneyLines(customer.cost ?? ""),
            purchase: moneyLines(customer.purchase ?? ""),
            items: customer.items.map((item) => ({
              ...item,
              gold: goldValue(item.gold ?? ""),
              weight: weight(item.weight ?? ""),
              actual: actualValue(item.actual ?? ""),
            })),
          })),
        };
      }
    }
  } catch {
    // A corrupt local draft should never prevent the form from opening.
  }
  return null;
}

function normalizeOtherCosts(value: OtherCost[] | string | undefined): OtherCost[] {
  if (Array.isArray(value)) {
    return value.slice(0, BRANCH_PURCHASE_CONFIG.maxOtherCosts).map((item) => ({
      id: item.id || newId(),
      detail: item.detail ?? "",
      amount: item.amount ?? "",
    }));
  }
  if (typeof value === "string" && value.trim()) {
    return value.split("\n").filter(Boolean).slice(0, BRANCH_PURCHASE_CONFIG.maxOtherCosts).map((line) => {
      const amount = line.match(/[\d,]+(?:\.\d{1,2})?/g)?.at(-1) ?? "";
      const detail = line
        .replace(/[\d,]+(?:\.\d{1,2})?\s*$/i, "")
        .replace(/^\s*\*?/, "")
        .replace(/[-–—\s]*RM\s*$/i, "")
        .replace(/[-–—\s]+$/, "")
        .trim();
      return { id: newId(), detail, amount };
    });
  }
  return [{ id: newId(), detail: "", amount: "" }];
}

export default function BranchPurchaseForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [activeCustomer, setActiveCustomer] = useState<string>("");
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
    if (draftLoaded) localStorage.setItem(BRANCH_PURCHASE_CONFIG.storageKey, JSON.stringify(form));
  }, [form, draftLoaded]);

  const selected = useMemo(
    () => form.customers.find((customer) => customer.id === activeCustomer) ?? form.customers[0],
    [form.customers, activeCustomer],
  );
  const totalItemRows = useMemo(
    () => form.customers.reduce((sum, customer) => sum + customer.items.length, 0),
    [form.customers],
  );

  const totals = useMemo(() => {
    const purchase = form.customers.reduce((sum, customer) => sum + sumMoneyLines(customer.purchase), 0);
    const cost = form.customers.reduce((sum, customer) => sum + sumMoneyLines(customer.cost), 0);
    const capital = numberValue(form.capital);
    const otherCosts = form.otherCosts.reduce(
      (sum, item) => sum + numberValue(item.amount),
      0,
    );
    return { capital, purchase, cost, otherCosts, balance: capital - purchase - cost - otherCosts };
  }, [form]);

  const addOtherCost = () => {
    if (form.otherCosts.length >= BRANCH_PURCHASE_CONFIG.maxOtherCosts) return;
    setForm({
      ...form,
      otherCosts: [...form.otherCosts, { id: newId(), detail: "", amount: "" }],
    });
  };

  const updateOtherCost = (id: string, patch: Partial<OtherCost>) => {
    setForm({
      ...form,
      otherCosts: form.otherCosts.map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  };

  const removeOtherCost = (id: string) => {
    setForm({ ...form, otherCosts: form.otherCosts.filter((item) => item.id !== id) });
  };

  const updateCustomer = (id: string, patch: Partial<Customer>) => {
    setForm((current) => ({
      ...current,
      customers: current.customers.map((customer) =>
        customer.id === id ? { ...customer, ...patch } : customer,
      ),
    }));
  };

  const addCustomer = () => {
    if (totalItemRows >= BRANCH_PURCHASE_CONFIG.maxItemRows) return;
    const customer = newCustomer();
    setForm((current) => ({
      ...current,
      customers: [...current.customers, customer],
    }));
    setActiveCustomer(customer.id);
  };

  const removeCustomer = (id: string) => {
    setForm((current) => {
      if (current.customers.length === 1) return current;
      const customers = current.customers.filter((customer) => customer.id !== id);
      setActiveCustomer(customers[0].id);
      return { ...current, customers };
    });
  };

  const addItem = (customer: Customer) => {
    if (totalItemRows >= BRANCH_PURCHASE_CONFIG.maxItemRows) return;
    updateCustomer(customer.id, { items: [...customer.items, newItem()] });
  };

  const updateItem = (customer: Customer, itemId: string, patch: Partial<Item>) => {
    updateCustomer(customer.id, {
      items: customer.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    });
  };

  const removeItem = (customer: Customer, itemId: string) => {
    if (customer.items.length === 1) return;
    updateCustomer(customer.id, {
      items: customer.items.filter((item) => item.id !== itemId),
    });
  };

  const clearForm = () => {
    const clean = { ...initialState, customers: [newCustomer()] };
    setForm(clean);
    setActiveCustomer(clean.customers[0].id);
  };

  return (
    <main className="app-shell branch-purchase-app">
      <FormTopbar currentFormId={BRANCH_PURCHASE_CONFIG.id} onClear={clearForm} />

      <section className="workspace no-print">
        <aside className="editor-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">Maklumat borang</span>
              <h2>Butiran utama</h2>
            </div>
            <span className="page-count">2 halaman</span>
          </div>

          <div className="form-grid form-grid-three">
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
            <label>
              Indeks
              <input
                value={form.index}
                onChange={(event) => setForm({ ...form, index: event.target.value })}
                placeholder="Nilai indeks"
              />
            </label>
          </div>

          <div className="customer-section-heading">
            <div>
              <span className="step-label">Rekod {PERSON_TERM}</span>
              <h2>{form.customers.length} {PERSON_TERM} · {totalItemRows} / {BRANCH_PURCHASE_CONFIG.maxItemRows} row emas</h2>
            </div>
            <button
              className="button button-small"
              type="button"
              onClick={addCustomer}
              disabled={totalItemRows >= BRANCH_PURCHASE_CONFIG.maxItemRows}
            >
              + Tambah {PERSON_TERM}
            </button>
          </div>

          <div className="customer-tabs" role="tablist" aria-label={`Senarai ${PERSON_TERM}`}>
            {form.customers.map((customer, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={selected?.id === customer.id}
                className={selected?.id === customer.id ? "customer-tab active" : "customer-tab"}
                key={customer.id}
                onClick={() => setActiveCustomer(customer.id)}
              >
                <span>{index + 1}</span>
                {customer.name || `${PERSON_TERM_TITLE} ${index + 1}`}
              </button>
            ))}
          </div>

          {selected && (
            <div className="customer-editor">
              <div className="customer-editor-head">
                <label className="grow-field">
                  Nama {PERSON_TERM}
                  <input
                    value={selected.name}
                    onChange={(event) => updateCustomer(selected.id, { name: event.target.value })}
                    placeholder={`Nama ${PERSON_TERM}`}
                  />
                </label>
                <button
                  type="button"
                  className="text-button danger"
                  disabled={form.customers.length === 1}
                  onClick={() => removeCustomer(selected.id)}
                >
                  Buang {PERSON_TERM}
                </button>
              </div>

              <div className="items-head">
                <strong>Item emas</strong>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => addItem(selected)}
                  disabled={totalItemRows >= BRANCH_PURCHASE_CONFIG.maxItemRows}
                >
                  + Tambah item
                </button>
              </div>

              <div className="items-table">
                <div className="items-table-head">
                  <span>Emas</span>
                  <span>Berat</span>
                  <span>Emas & berat sebenar</span>
                  <span />
                </div>
                {selected.items.map((item) => (
                  <div className="item-row" key={item.id}>
                    <input
                      aria-label="Jenis emas"
                      value={item.gold}
                      onChange={(event) => updateItem(selected, item.id, { gold: event.target.value })}
                      onBlur={(event) => updateItem(selected, item.id, { gold: goldValue(event.target.value) })}
                      placeholder="Jenis emas"
                    />
                    <input
                      aria-label="Berat"
                      value={item.weight}
                      onChange={(event) => updateItem(selected, item.id, { weight: event.target.value })}
                      onBlur={(event) => updateItem(selected, item.id, { weight: weight(event.target.value) })}
                      inputMode="decimal"
                      placeholder="Berat (g)"
                    />
                    <input
                      aria-label="Emas dan berat sebenar"
                      value={item.actual}
                      onChange={(event) => updateItem(selected, item.id, { actual: event.target.value })}
                      onBlur={(event) => updateItem(selected, item.id, { actual: actualValue(event.target.value) })}
                      placeholder="Jika ada perubahan"
                    />
                    <button
                      type="button"
                      className="remove-item"
                      aria-label="Buang item"
                      disabled={selected.items.length === 1}
                      onClick={() => removeItem(selected, item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-grid form-grid-two notes-grid">
                <label>
                  Kos
                  <textarea
                    rows={4}
                    value={selected.cost}
                    onChange={(event) => updateCustomer(selected.id, { cost: event.target.value })}
                    onBlur={(event) => updateCustomer(selected.id, { cost: moneyLines(event.target.value) })}
                    placeholder="Amaun kos"
                  />
                </label>
                <label>
                  Belian
                  <textarea
                    rows={4}
                    value={selected.purchase}
                    onChange={(event) => updateCustomer(selected.id, { purchase: event.target.value })}
                    onBlur={(event) => updateCustomer(selected.id, { purchase: moneyLines(event.target.value) })}
                    placeholder="Amaun belian"
                  />
                </label>
              </div>
            </div>
          )}

          <section className="capital-card">
            <div className="capital-card-heading">
              <div>
                <span className="step-label">Ringkasan modal</span>
                <h2>Kiraan automatik</h2>
              </div>
              <span>RM</span>
            </div>
            <label className="capital-input">
              Jumlah Modal (User Isi)
              <input
                inputMode="decimal"
                value={form.capital}
                onChange={(event) => setForm({ ...form, capital: event.target.value })}
                onBlur={(event) => setForm((current) => ({ ...current, capital: moneyValue(event.target.value) }))}
                placeholder="Masukkan jumlah modal"
              />
            </label>
            <div className="capital-lines">
              <div><span>Belian</span><strong>{money(totals.purchase)}</strong></div>
              <div><span>Kos</span><strong>{money(totals.cost)}</strong></div>
              <div className="other-costs-field">
                <div className="other-costs-heading">
                  <span>Lain-Lain Kos</span>
                  <button
                    type="button"
                    onClick={addOtherCost}
                    disabled={form.otherCosts.length >= BRANCH_PURCHASE_CONFIG.maxOtherCosts}
                  >
                    + Tambah kos
                  </button>
                </div>
                <div className="other-cost-rows">
                  {form.otherCosts.map((item, index) => (
                    <div className="other-cost-row" key={item.id}>
                      <span className="cost-number">{index + 1}</span>
                      <label>
                        Butiran kos
                        <input
                          value={item.detail}
                          onChange={(event) => updateOtherCost(item.id, { detail: event.target.value })}
                          placeholder="Butiran kos"
                        />
                      </label>
                      <label>
                        Amaun (RM)
                        <input
                          inputMode="decimal"
                          value={item.amount}
                          onChange={(event) => updateOtherCost(item.id, { amount: event.target.value })}
                          onBlur={(event) => updateOtherCost(item.id, { amount: moneyValue(event.target.value) })}
                          placeholder="Masukkan amaun"
                        />
                      </label>
                      <button
                        type="button"
                        className="remove-cost"
                        onClick={() => removeOtherCost(item.id)}
                        aria-label={`Buang lain-lain kos ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="other-cost-limit">{form.otherCosts.length} / {BRANCH_PURCHASE_CONFIG.maxOtherCosts} kos digunakan</p>
              </div>
              <div className="balance-line"><span>Baki Modal</span><strong>{money(totals.balance)}</strong></div>
            </div>
          </section>
        </aside>

        <section className="preview-panel">
          <div className="preview-toolbar">
            <div>
              <span className="step-label">Pratonton langsung</span>
              <h2>Halaman 1</h2>
            </div>
            <span>Halaman 2 disertakan secara automatik</span>
          </div>
          <div className="preview-scroll">
            <PageOne form={form} totals={totals} preview />
          </div>
        </section>
      </section>

      <section className="print-document" aria-label="Dokumen untuk dicetak">
        <PageOne form={form} totals={totals} />
        <PageTwo />
      </section>
    </main>
  );
}

function PageOne({ form, totals, preview = false }: {
  form: FormState;
  totals: { capital: number; purchase: number; cost: number; otherCosts: number; balance: number };
  preview?: boolean;
}) {
  const printable = form.customers.reduce<{ customers: Customer[]; usedRows: number }>(
    (result, customer) => {
      const availableRows = Math.max(0, BRANCH_PURCHASE_CONFIG.maxItemRows - result.usedRows);
      const items = customer.items.slice(0, availableRows);
      return items.length
        ? {
            customers: [...result.customers, { ...customer, items }],
            usedRows: result.usedRows + items.length,
          }
        : result;
    },
    { customers: [], usedRows: 0 },
  );
  const visibleCustomers = printable.customers;
  const usedItemRows = printable.usedRows;
  const formattedDate = form.date
    ? form.date.split("-").reverse().join("/")
    : "";

  return (
    <article className={preview ? "paper page-one page-one-manual paper-preview" : "paper page-one page-one-manual"}>
      <header className="manual-paper-header">
        <div className="manual-header-details">
          <p>
            <strong>CAWANGAN</strong>
            <strong aria-hidden="true">:</strong>
            <span>{form.branch.toUpperCase()}</span>
          </p>
          <p>
            <strong>TARIKH</strong>
            <strong aria-hidden="true">:</strong>
            <span>{formattedDate}</span>
          </p>
        </div>
        <div>
          <p><strong>INDEKS :</strong></p>
          <p><strong>{form.index}</strong></p>
        </div>
      </header>

      <section className="manual-form-table">
        <div className="manual-table-heading">
          <strong>NAMA</strong>
          <strong>EMAS</strong>
          <strong>BERAT</strong>
          <strong>EMAS &amp; BERAT SEBENAR</strong>
          <strong>KOS</strong>
          <strong>BELIAN</strong>
        </div>
        <div className={usedItemRows === BRANCH_PURCHASE_CONFIG.maxItemRows ? "manual-table-body manual-table-body-full" : "manual-table-body"}>
          <div className="manual-column-lines" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <table
            className="manual-entry-table"
            style={{ height: `${Math.max(1, usedItemRows) * 7.46}%` }}
          >
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <tbody>
              {visibleCustomers.flatMap((customer, customerIndex) =>
                customer.items.map((item, itemIndex) => (
                  <tr key={item.id} className={itemIndex === customer.items.length - 1 ? "group-end" : ""}>
                    {itemIndex === 0 && (
                      <td rowSpan={customer.items.length} className="manual-group-cell">
                        <span>{customerIndex + 1})</span> {customer.name}
                      </td>
                    )}
                    <td>{goldValue(item.gold)}</td>
                    <td>{weight(item.weight)}</td>
                    <td>{actualValue(item.actual)}</td>
                    {itemIndex === 0 && (
                      <td rowSpan={customer.items.length} className="manual-group-cell preline">{moneyLines(customer.cost)}</td>
                    )}
                    {itemIndex === 0 && (
                      <td rowSpan={customer.items.length} className="manual-group-cell preline">{moneyLines(customer.purchase)}</td>
                    )}
                  </tr>
                )),
              )}
            </tbody>
          </table>

          <div className="print-capital-summary manual-capital-summary">
            <div><span>JUMLAH MODAL</span><strong>{money(totals.capital)}</strong></div>
            <div><span>BELIAN</span><strong>{money(totals.purchase)}</strong></div>
            <div><span>KOS</span><strong>{money(totals.cost)}</strong></div>
            <div className="print-other-costs">
              <span>
                LAIN-LAIN KOS
                <small>
                  {form.otherCosts.filter((item) => item.detail || item.amount).map((item) => (
                    <span key={item.id}>
                      *{item.detail || "Kos"} - {money(numberValue(item.amount))}
                    </span>
                  ))}
                </small>
              </span>
              <strong>{money(totals.otherCosts)}</strong>
            </div>
            <div className="print-balance"><span>BAKI MODAL</span><strong>{money(totals.balance)}</strong></div>
          </div>
        </div>
      </section>
    </article>
  );
}

function PageTwo() {
  return (
    <article className="paper page-two page-two-template">
      <Image
        src={BRANCH_PURCHASE_CONFIG.assets.pageTwo}
        alt="Halaman kedua asal - untuk kegunaan HQ sahaja"
        width={2483}
        height={3512}
        priority
      />
    </article>
  );
}
