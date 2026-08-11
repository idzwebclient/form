export const FORM_REGISTRY = [
  { id: "branch-purchase", menuLabel: "Branch Purchase", title: "Branch Purchase Form", href: "/" },
  { id: "claim-form", menuLabel: "Claim", title: "Reimbursement Claim Form", href: "/claim-form" },
  { id: "advance-form", menuLabel: "Advance", title: "Salary / Commission Advance Form", href: "/advance-form" },
] as const;

export type FormId = (typeof FORM_REGISTRY)[number]["id"];
