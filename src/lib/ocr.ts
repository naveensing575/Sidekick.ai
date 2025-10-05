import { createWorker } from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

let worker: Awaited<ReturnType<typeof createWorker>> | null = null

async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng')
  }
  return worker
}

export async function extractTextFromImage(file: File): Promise<OCRResult> {
  try {
    const worker = await getWorker()

    const { data } = await worker.recognize(file)

    return {
      text: data.text.trim(),
      confidence: data.confidence
    }
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error('Failed to extract text from image')
  }
}

export async function extractTextFromMultipleImages(files: File[]): Promise<string> {
  const results = await Promise.all(
    files.map(file => extractTextFromImage(file))
  )

  return results
    .filter(r => r.text.length > 0)
    .map((r, i) => `[Image ${i + 1}]:\n${r.text}`)
    .join('\n\n')
}

export async function terminateOCRWorker() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
