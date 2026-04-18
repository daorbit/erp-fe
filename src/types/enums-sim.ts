// Separate from the main enums file to keep Sim-specific labels isolated.
export const SIM_STATUS_LABELS = {
  not_used: 'Not Used',
  allotted: 'Allotted',
  surrendered: 'Surrendered',
} as const;

export const SIM_TYPE_LABELS = {
  prepaid: 'Prepaid',
  postpaid: 'Postpaid',
} as const;
