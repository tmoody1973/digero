import { useState } from 'react'
import {
  Camera,
  X,
  Check,
  Plus,
  BookOpen,
  ChevronRight,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import type { Recipe } from '../types'

type ScanStep = 'cover' | 'scanning' | 'processing' | 'review' | 'complete'

interface ScannedRecipePreview {
  title: string
  ingredientCount: number
  instructionCount: number
}

interface ScanSessionProps {
  /** Called when user captures the cookbook cover photo */
  onCaptureCover?: (imageData: string) => void
  /** Called when user scans a recipe page */
  onScanRecipePage?: (imageData: string) => void
  /** Called when user finishes the scanning session */
  onEndScanSession?: (recipes: Recipe[]) => void
  /** Called when user cancels the session */
  onCancel?: () => void
}

export function ScanSession({
  onCaptureCover,
  onScanRecipePage,
  onEndScanSession,
  onCancel,
}: ScanSessionProps) {
  const [step, setStep] = useState<ScanStep>('cover')
  const [bookName, setBookName] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [scannedRecipes, setScannedRecipes] = useState<ScannedRecipePreview[]>([])
  const [currentRecipe, setCurrentRecipe] = useState<ScannedRecipePreview | null>(null)

  // Simulated cover capture
  const handleCaptureCover = () => {
    // In real app, this would capture from camera
    const mockCoverUrl = 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800'
    setCoverImage(mockCoverUrl)
    onCaptureCover?.(mockCoverUrl)
    setStep('scanning')
  }

  // Simulated recipe scan
  const handleScanRecipe = () => {
    setStep('processing')
    // Simulate AI processing
    setTimeout(() => {
      const mockRecipe: ScannedRecipePreview = {
        title: `Recipe ${scannedRecipes.length + 1}`,
        ingredientCount: Math.floor(Math.random() * 10) + 5,
        instructionCount: Math.floor(Math.random() * 8) + 4,
      }
      setCurrentRecipe(mockRecipe)
      onScanRecipePage?.('mock-image-data')
      setStep('review')
    }, 2000)
  }

  // Save current recipe and scan another
  const handleScanAnother = () => {
    if (currentRecipe) {
      setScannedRecipes((prev) => [...prev, currentRecipe])
      setCurrentRecipe(null)
    }
    setStep('scanning')
  }

  // Save current recipe and finish
  const handleFinish = () => {
    if (currentRecipe) {
      setScannedRecipes((prev) => [...prev, currentRecipe])
    }
    setStep('complete')
  }

  // Complete the session
  const handleComplete = () => {
    onEndScanSession?.([] as Recipe[]) // In real app, would pass actual recipes
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 px-4 py-4">
        <button
          onClick={onCancel}
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
        >
          <X className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-white">Scan Cookbook</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        {/* Step: Capture Cover */}
        {step === 'cover' && (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-amber-500/20">
              <BookOpen className="h-16 w-16 text-amber-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Start with the Cover</h2>
            <p className="mb-8 max-w-sm text-center text-stone-400">
              Take a photo of your cookbook cover. This will help organize all recipes you scan from this book.
            </p>

            {/* Book name input */}
            <input
              type="text"
              placeholder="Cookbook name (optional)"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              className="mb-6 w-full max-w-sm rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />

            <button
              onClick={handleCaptureCover}
              className="flex items-center gap-3 rounded-2xl bg-orange-500 px-8 py-4 font-semibold text-white transition-all hover:bg-orange-600 active:scale-95"
            >
              <Camera className="h-6 w-6" />
              Capture Cover Photo
            </button>
          </div>
        )}

        {/* Step: Scanning (Camera View) */}
        {step === 'scanning' && (
          <div className="flex flex-1 flex-col">
            {/* Cover preview bar */}
            {coverImage && (
              <div className="flex items-center gap-3 border-b border-stone-800 bg-stone-900 px-4 py-3">
                <img
                  src={coverImage}
                  alt="Cookbook cover"
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {bookName || 'Untitled Cookbook'}
                  </p>
                  <p className="text-sm text-stone-400">
                    {scannedRecipes.length} recipe{scannedRecipes.length !== 1 ? 's' : ''} scanned
                  </p>
                </div>
              </div>
            )}

            {/* Camera viewfinder (simulated) */}
            <div className="relative flex-1 bg-stone-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-stone-600">
                    <Camera className="h-12 w-12 text-stone-500" />
                  </div>
                  <p className="text-stone-400">Camera viewfinder</p>
                </div>
              </div>

              {/* Scan frame overlay */}
              <div className="absolute inset-8 rounded-3xl border-2 border-orange-500/50" />
              <div className="absolute left-8 top-8 h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-orange-500" />
              <div className="absolute right-8 top-8 h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-orange-500" />
              <div className="absolute bottom-8 left-8 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-orange-500" />
              <div className="absolute bottom-8 right-8 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-orange-500" />
            </div>

            {/* Controls */}
            <div className="border-t border-stone-800 bg-stone-900 p-6">
              <p className="mb-4 text-center text-stone-400">
                Position the recipe page within the frame
              </p>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={handleFinish}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-stone-600 text-stone-400 transition-colors hover:border-stone-400 hover:text-stone-200"
                >
                  <Check className="h-6 w-6" />
                </button>
                <button
                  onClick={handleScanRecipe}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 active:scale-95"
                >
                  <Camera className="h-8 w-8" />
                </button>
                <div className="h-14 w-14" /> {/* Spacer for symmetry */}
              </div>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500/20">
              <Sparkles className="h-12 w-12 animate-pulse text-orange-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Extracting Recipe</h2>
            <p className="mb-6 text-stone-400">AI is reading the recipe...</p>
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Step: Review Extracted Recipe */}
        {step === 'review' && currentRecipe && (
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recipe Extracted!</h2>
                <p className="text-sm text-stone-400">Review the details below</p>
              </div>
            </div>

            {/* Extracted recipe preview */}
            <div className="mb-6 rounded-2xl border border-stone-700 bg-stone-800 p-4">
              <h3 className="mb-4 text-xl font-semibold text-white">{currentRecipe.title}</h3>
              <div className="flex gap-4">
                <div className="rounded-xl bg-stone-700 px-4 py-2">
                  <p className="text-2xl font-bold text-orange-500">{currentRecipe.ingredientCount}</p>
                  <p className="text-sm text-stone-400">Ingredients</p>
                </div>
                <div className="rounded-xl bg-stone-700 px-4 py-2">
                  <p className="text-2xl font-bold text-orange-500">{currentRecipe.instructionCount}</p>
                  <p className="text-sm text-stone-400">Steps</p>
                </div>
              </div>
            </div>

            {/* Previously scanned */}
            {scannedRecipes.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-sm font-medium text-stone-400">
                  Previously scanned ({scannedRecipes.length})
                </p>
                <div className="space-y-2">
                  {scannedRecipes.map((recipe, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl bg-stone-800/50 px-3 py-2"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-stone-300">{recipe.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto space-y-3">
              <button
                onClick={handleScanAnother}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-orange-500 bg-orange-500/10 py-4 font-semibold text-orange-500 transition-all hover:bg-orange-500/20"
              >
                <Plus className="h-5 w-5" />
                Scan Another Recipe
              </button>
              <button
                onClick={handleFinish}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-semibold text-white transition-all hover:bg-orange-600"
              >
                <Check className="h-5 w-5" />
                Done Scanning
              </button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Scanning Complete!</h2>
              <p className="text-stone-400">
                {scannedRecipes.length} recipe{scannedRecipes.length !== 1 ? 's' : ''} added from{' '}
                <span className="font-medium text-white">{bookName || 'your cookbook'}</span>
              </p>
            </div>

            {/* Cover and recipes summary */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-stone-700 bg-stone-800">
              {coverImage && (
                <div className="relative aspect-[3/1] overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Cookbook cover"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-800 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="font-semibold text-white">{bookName || 'Untitled Cookbook'}</p>
                  </div>
                </div>
              )}
              <div className="divide-y divide-stone-700">
                {scannedRecipes.map((recipe, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-white">{recipe.title}</span>
                    <ChevronRight className="h-5 w-5 text-stone-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <button
                onClick={() => setStep('scanning')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-700 py-4 font-semibold text-stone-300 transition-all hover:bg-stone-800"
              >
                <RotateCcw className="h-5 w-5" />
                Scan More from This Book
              </button>
              <button
                onClick={handleComplete}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-semibold text-white transition-all hover:bg-orange-600"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
