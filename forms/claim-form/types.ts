export type ClaimRow = {
  id: string;
  detail: string;
  date: string;
  amount: string;
};

export type ClaimFormState = {
  name: string;
  branch: string;
  date: string;
  claims: ClaimRow[];
  approvedBy: string;
  approverName: string;
};
