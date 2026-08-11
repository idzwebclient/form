export const BRANCH_PURCHASE_CONFIG = {
  id: "branch-purchase",
  title: "Branch Purchase Form",
  storageKey: "qudani-form-v1",
  personTerm: "runner",
  maxItemRows: 10,
  maxOtherCosts: 4,
  assets: {
    logo: "/brand/qudani-wordmark-white.png",
    pageTwo: "/forms/branch-purchase/page-2-template.png",
  },
} as const;

export const PERSON_TERM_TITLE =
  BRANCH_PURCHASE_CONFIG.personTerm.charAt(0).toUpperCase() +
  BRANCH_PURCHASE_CONFIG.personTerm.slice(1);
