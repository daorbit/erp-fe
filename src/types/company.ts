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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
