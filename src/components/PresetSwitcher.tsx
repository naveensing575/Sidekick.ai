'use client';

import React from 'react';

const PRESETS = ['General', 'Code', 'Summarizer'] as const;
type Preset = typeof PRESETS[number];

interface Props {
  active: Preset;
  onChange: (preset: Preset) => void;
}

export default function PresetSwitcher({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-3">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => onChange(preset)}
          className={`px-3 py-1 rounded-full border text-sm transition
            ${active === preset
              ? 'bg-black text-white border-black dark:bg-white dark:text-black'
              : 'bg-transparent text-gray-500 border-gray-300 hover:text-black dark:hover:text-white'}
          `}
        >
          {preset}
        </button>
      ))}
    </div>
  );
}
