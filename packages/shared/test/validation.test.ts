import { describe, expect, it } from 'vitest';
import { ALIBI_MIN_LENGTH, EMPTY_RECRUIT_FORM, validateRecruit } from '../src';

const valid = {
  codename: 'Waffles Wallace',
  territoryId: 't-waffle',
  productLineId: 'p-croissant',
  startDate: '2026-12-01',
  alibi: 'I was at the knitting circle all night, ask anyone.',
};

describe('validateRecruit', () => {
  it('accepts a complete form', () => {
    expect(validateRecruit(valid)).toEqual({});
  });

  it('flags every required field on an empty form', () => {
    expect(Object.keys(validateRecruit(EMPTY_RECRUIT_FORM)).sort()).toEqual(
      ['alibi', 'codename', 'productLineId', 'territoryId'],
    );
  });

  it('enforces the alibi minimum length', () => {
    const errors = validateRecruit({ ...valid, alibi: 'x'.repeat(ALIBI_MIN_LENGTH - 1) });
    expect(errors.alibi).toMatch(/too thin/i);
    expect(validateRecruit({ ...valid, alibi: 'x'.repeat(ALIBI_MIN_LENGTH) }).alibi).toBeUndefined();
  });

  it('treats start date as optional but checks its format', () => {
    expect(validateRecruit({ ...valid, startDate: '' }).startDate).toBeUndefined();
    expect(validateRecruit({ ...valid, startDate: '12/01/2026' }).startDate).toBeDefined();
  });
});
