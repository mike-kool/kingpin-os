// Validation for the "Recruit New Lieutenant" form. Pure functions so every
// kit shows the same errors at the same time.

export interface RecruitForm {
  codename: string;
  territoryId: string;
  productLineId: string;
  startDate: string;
  alibi: string;
}

export type RecruitErrors = Partial<Record<keyof RecruitForm, string>>;

export const ALIBI_MIN_LENGTH = 20;
export const CODENAME_MAX_LENGTH = 40;

export const EMPTY_RECRUIT_FORM: RecruitForm = {
  codename: '',
  territoryId: '',
  productLineId: '',
  startDate: '',
  alibi: '',
};

export function validateRecruit(form: RecruitForm): RecruitErrors {
  const errors: RecruitErrors = {};
  const codename = form.codename.trim();
  if (!codename) errors.codename = 'Every lieutenant needs a codename.';
  else if (codename.length > CODENAME_MAX_LENGTH)
    errors.codename = `Keep it under ${CODENAME_MAX_LENGTH} characters. Nobody can shout that.`;

  if (!form.territoryId) errors.territoryId = 'Pick a territory.';
  if (!form.productLineId) errors.productLineId = 'Pick a product line.';

  if (form.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.startDate))
    errors.startDate = 'Use a real date.';

  const alibi = form.alibi.trim();
  if (!alibi) errors.alibi = 'An alibi is required. Obviously.';
  else if (alibi.length < ALIBI_MIN_LENGTH)
    errors.alibi = `Too thin. At least ${ALIBI_MIN_LENGTH} characters.`;

  return errors;
}

export function hasErrors(errors: RecruitErrors): boolean {
  return Object.keys(errors).length > 0;
}
