export type Item = {
  id: string;
  gold: string;
  weight: string;
  actual: string;
};

export type Customer = {
  id: string;
  name: string;
  items: Item[];
  cost: string;
  purchase: string;
};

export type OtherCost = {
  id: string;
  detail: string;
  amount: string;
};

export type FormState = {
  branch: string;
  date: string;
  index: string;
  capital: string;
  otherCosts: OtherCost[];
  customers: Customer[];
};
