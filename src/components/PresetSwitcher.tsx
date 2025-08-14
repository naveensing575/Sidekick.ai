'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PRESETS = ['General', 'Code', 'Summarizer'] as const
type Preset = (typeof PRESETS)[number]

interface Props {
  active: Preset
  onChange: (preset: Preset) => void
}

export default function PresetSwitcher({ active, onChange }: Props) {
  return (
    <Tabs
      value={active}
      onValueChange={(val: any) => onChange(val as Preset)}
      className="mb-3 text-white"
    >
      <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
        {PRESETS.map((preset) => (
          <TabsTrigger
            key={preset}
            value={preset}
            className="px-4 py-1 text-sm rounded-full border border-gray-700
              data-[state=active]:bg-white data-[state=active]:text-black
              text-white hover:text-gray-300 cursor-pointer"
          >
            {preset}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}