import { useState, useEffect } from 'react';

export interface NumberSeriesConfig {
  prefix: string;
  includeYear: boolean;
  yearFormat: 'YYYY' | 'YY';
  yearPosition: 'Prefix' | 'Middle' | 'Suffix' | 'None';
  separator: '-' | '/' | '.' | '' | '_';
  sequencePadding: number; // 3 -> 001, 4 -> 0001
  nextSequence: number;
}

export interface SchoolNumberingSettings {
  admissionSeries: NumberSeriesConfig;
  registrationSeries: NumberSeriesConfig;
  inquirySeries: NumberSeriesConfig;
}

const STORAGE_KEY_NUMBERING = 'schoolerp_admission_numbering_settings_v2';

export const DEFAULT_NUMBERING_SETTINGS: SchoolNumberingSettings = {
  admissionSeries: {
    prefix: 'ADM',
    includeYear: true,
    yearFormat: 'YYYY',
    yearPosition: 'Middle',
    separator: '-',
    sequencePadding: 4,
    nextSequence: 101
  },
  registrationSeries: {
    prefix: 'REG',
    includeYear: true,
    yearFormat: 'YYYY',
    yearPosition: 'Middle',
    separator: '-',
    sequencePadding: 4,
    nextSequence: 201
  },
  inquirySeries: {
    prefix: 'INQ',
    includeYear: true,
    yearFormat: 'YYYY',
    yearPosition: 'Middle',
    separator: '-',
    sequencePadding: 4,
    nextSequence: 301
  }
};

export function formatSeriesNumber(config: NumberSeriesConfig, seqNumber: number, customYear?: number): string {
  const currentYear = customYear || new Date().getFullYear();
  const yearStr = config.yearFormat === 'YY' ? String(currentYear).slice(-2) : String(currentYear);
  const paddedSeq = String(seqNumber).padStart(config.sequencePadding, '0');
  const sep = config.separator;

  const p = config.prefix.trim();

  if (!config.includeYear || config.yearPosition === 'None') {
    return p ? `${p}${sep}${paddedSeq}` : paddedSeq;
  }

  switch (config.yearPosition) {
    case 'Prefix':
      // e.g. 2026-ADM-0001 or 2026-0001
      return p ? `${yearStr}${sep}${p}${sep}${paddedSeq}` : `${yearStr}${sep}${paddedSeq}`;
    case 'Middle':
      // e.g. ADM-2026-0001
      return p ? `${p}${sep}${yearStr}${sep}${paddedSeq}` : `${yearStr}${sep}${paddedSeq}`;
    case 'Suffix':
      // e.g. ADM-0001-2026
      return p ? `${p}${sep}${paddedSeq}${sep}${yearStr}` : `${paddedSeq}${sep}${yearStr}`;
    default:
      return `${p}${sep}${yearStr}${sep}${paddedSeq}`;
  }
}

export function getNumberingSettings(): SchoolNumberingSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NUMBERING);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading numbering settings:', e);
  }
  return DEFAULT_NUMBERING_SETTINGS;
}

export function saveNumberingSettings(settings: SchoolNumberingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_NUMBERING, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving numbering settings:', e);
  }
}

export function generateAndIncrementNumber(type: 'admission' | 'registration' | 'inquiry'): string {
  const currentSettings = getNumberingSettings();
  let key: keyof SchoolNumberingSettings = 'admissionSeries';
  if (type === 'registration') key = 'registrationSeries';
  if (type === 'inquiry') key = 'inquirySeries';

  const cfg = currentSettings[key];
  const generated = formatSeriesNumber(cfg, cfg.nextSequence);

  // Increment and persist next sequence
  currentSettings[key] = {
    ...cfg,
    nextSequence: cfg.nextSequence + 1
  };
  saveNumberingSettings(currentSettings);

  return generated;
}

export function peekNextNumber(type: 'admission' | 'registration' | 'inquiry'): string {
  const currentSettings = getNumberingSettings();
  let key: keyof SchoolNumberingSettings = 'admissionSeries';
  if (type === 'registration') key = 'registrationSeries';
  if (type === 'inquiry') key = 'inquirySeries';

  const cfg = currentSettings[key];
  return formatSeriesNumber(cfg, cfg.nextSequence);
}

export function useNumberingSettings() {
  const [settings, setSettings] = useState<SchoolNumberingSettings>(() => getNumberingSettings());

  useEffect(() => {
    saveNumberingSettings(settings);
  }, [settings]);

  const updateAdmissionSeries = (cfg: Partial<NumberSeriesConfig>) => {
    setSettings((prev) => ({
      ...prev,
      admissionSeries: { ...prev.admissionSeries, ...cfg }
    }));
  };

  const updateRegistrationSeries = (cfg: Partial<NumberSeriesConfig>) => {
    setSettings((prev) => ({
      ...prev,
      registrationSeries: { ...prev.registrationSeries, ...cfg }
    }));
  };

  const updateInquirySeries = (cfg: Partial<NumberSeriesConfig>) => {
    setSettings((prev) => ({
      ...prev,
      inquirySeries: { ...prev.inquirySeries, ...cfg }
    }));
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_NUMBERING_SETTINGS);
  };

  return {
    settings,
    updateAdmissionSeries,
    updateRegistrationSeries,
    updateInquirySeries,
    resetToDefault,
    resetToDefaults: resetToDefault
  };
}

export const useAdmissionNumberConfig = useNumberingSettings;
