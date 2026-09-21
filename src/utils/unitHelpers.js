/**
 * Helper per la gestione centralizzata delle unità di misura e relativi step di default/formattazione.
 */

export const UNIT_TYPES = {
  UNIT: 'unit',
  G: 'g',
  ML: 'ml',
};

export const UNIT_CONFIG = {
  unit: {
    label: 'Pezzi (pz)',
    shortLabel: 'pz',
    defaultStep: 1,
    defaultThreshold: 1,
    defaultFullStock: 2,
    format: (val) => `${val} pz`,
  },
  g: {
    label: 'Grammi (g)',
    shortLabel: 'g',
    defaultStep: 100,
    defaultThreshold: 200,
    defaultFullStock: 1000,
    format: (val) => {
      if (val >= 1000) {
        const kg = val / 1000;
        return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
      }
      return `${val} g`;
    },
  },
  ml: {
    label: 'Millilitri (ml)',
    shortLabel: 'ml',
    defaultStep: 250,
    defaultThreshold: 500,
    defaultFullStock: 1000,
    format: (val) => {
      if (val >= 1000) {
        const l = val / 1000;
        return `${Number.isInteger(l) ? l : l.toFixed(1)} L`;
      }
      return `${val} ml`;
    },
  },
};

export function formatQuantity(val, unitType) {
  const config = UNIT_CONFIG[unitType] || UNIT_CONFIG.unit;
  return config.format(val ?? 0);
}

export function getDefaultStep(unitType) {
  return UNIT_CONFIG[unitType]?.defaultStep ?? 1;
}

export function getShortUnitLabel(unitType) {
  return UNIT_CONFIG[unitType]?.shortLabel ?? 'pz';
}
