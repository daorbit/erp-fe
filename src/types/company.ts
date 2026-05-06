export interface ICompanyAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ICompany {
  _id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  website?: string;
  address?: ICompanyAddress;
  industry?: string;
  logo?: string;
  contactPerson?: string;
  gstNumber?: string;
  panNumber?: string;
  maxEmployees?: number;
  subscription?: string;
  isActive: boolean;
  /** Set on sibling companies; absent on main (parent) companies. */
  parentCompany?: string;
  createdAt: string;
  updatedAt: string;
}
