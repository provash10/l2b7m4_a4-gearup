export interface IRentalItemInput {
  gearItemId: string;
  quantity: number;
}

export interface ICreateRentalInput {
  startDate: string;
  endDate: string;
  items: IRentalItemInput[];
}
