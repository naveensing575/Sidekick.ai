'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Settings, X } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { POPULAR_MODELS } from '@/types/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const { model, temperature, maxTokens, setModel, setTemperature, setMaxTokens, resetSettings } = useSettingsStore()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-slate-700/50"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-slate-300" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-xl font-semibold">Settings</AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <AlertDialogDescription className="text-slate-400">
            Configure your AI assistant preferences
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs defaultValue="model" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
            <TabsTrigger value="model" className="data-[state=active]:bg-slate-600">
              Model
            </TabsTrigger>
            <TabsTrigger value="parameters" className="data-[state=active]:bg-slate-600">
              Parameters
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-600">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="model" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Select AI Model</h3>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {POPULAR_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        model === m.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-slate-400">{m.provider}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Context: {m.contextLength.toLocaleString()} tokens
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6 mt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Temperature</label>
                <span className="text-sm text-slate-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Lower = more focused, Higher = more creative
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Max Tokens</label>
                <span className="text-sm text-slate-400">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Maximum length of the response
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                <h3 className="text-sm font-medium mb-2">Current Configuration</h3>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Model: <span className="text-white">{POPULAR_MODELS.find(m => m.id === model)?.name}</span></div>
                  <div>Temperature: <span className="text-white">{temperature}</span></div>
                  <div>Max Tokens: <span className="text-white">{maxTokens}</span></div>
                </div>
              </div>

              <Button
                onClick={() => {
                  resetSettings()
                  setOpen(false)
                }}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-700 text-slate-300"
              >
                Reset to Defaults
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={() => setOpen(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
