import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseState, serializeState } from '../src/urlState';
import { DEVICES, findDevice } from '../src/devices';

describe('shell URL state', () => {
  it('falls back to defaults for missing or unknown values', () => {
    expect(parseState('')).toEqual(DEFAULT_STATE);
    expect(parseState('?lib=bootstrap&tab=nope&view=tv&device=nokia')).toEqual(DEFAULT_STATE);
  });

  it('round-trips a full state', () => {
    const state = { lib: 'mui', tab: 'rivals', view: 'mobile', device: 'pixel-10' } as const;
    expect(parseState(serializeState(state))).toEqual(state);
  });
});

describe('devices', () => {
  it('offers five iPhones and five Android phones with unique ids', () => {
    expect(DEVICES.filter((d) => d.os === 'iOS')).toHaveLength(5);
    expect(DEVICES.filter((d) => d.os === 'Android')).toHaveLength(5);
    expect(new Set(DEVICES.map((d) => d.id)).size).toBe(DEVICES.length);
  });

  it('defaults to iPhone 17', () => {
    expect(findDevice(undefined).name).toBe('iPhone 17');
  });
});
