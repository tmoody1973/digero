/**
 * Scan Session Modal Component
 *
 * Full-screen modal managing the complete cookbook scanning workflow.
 * Handles state machine for cover, scanning, processing, review, and complete steps.
 */

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { X, AlertCircle, RotateCcw } from "lucide-react-native";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { CoverStep } from "./CoverStep";
import { ScanningStep } from "./ScanningStep";
import { ProcessingStep } from "./ProcessingStep";
import { ReviewStep } from "./ReviewStep";
import { CompleteStep } from "./CompleteStep";
import { ScannedRecipeEditForm } from "./ScannedRecipeEditForm";
import { CameraViewfinder } from "./CameraViewfinder";

import type {
  ScanSessionModalProps,
  ScanStep,
  ExtractedRecipeData,
  ScannedRecipePreview,
  PageData,
} from "./types";

import { mergeMultiPageRecipe, type PageRecipeData } from "@/convex/lib/multiPageMerge";

/**
 * ScanSessionModal Component
 *
 * Main orchestrator for the scanning workflow:
 * 1. Cover Step - Optional cover photo and book name
 * 2. Scanning Step - Camera viewfinder for recipe pages
 * 3. Processing Step - AI extraction loading state
 * 4. Review Step - Extraction summary and actions
 * 5. Complete Step - Session summary
 *
 * Also handles:
 * - Multi-page recipe flow
 * - Error states with retry
 * - Edit form for modifying extracted data
 */
export function ScanSessionModal({
  visible,
  onClose,
  existingCookbookId,
  existingCookbookName,
}: ScanSessionModalProps) {
  // Session state
  const [step, setStep] = useState<ScanStep>("cover");
  const [bookName, setBookName] = useState(existingCookbookName || "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | null>(null);
  const [sessionId, setSessionId] = useState<Id<"scanSessions"> | null>(null);
  const [physicalCookbookId, setPhysicalCookbookId] = useState<Id<"physicalCookbooks"> | null>(
    existingCookbookId || null
  );

  // Recipe state
  const [scannedRecipes, setScannedRecipes] = useState<ScannedRecipePreview[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<ExtractedRecipeData | null>(null);
  const [multiPageData, setMultiPageData] = useState<PageData[]>([]);
  const [isMultiPage, setIsMultiPage] = useState(false);

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isCoverCapture, setIsCoverCapture] = useState(false);
  const [error, setError] = useState<{ type: string; message: string } | null>(null);

  // Convex mutations and actions
  const startSession = useMutation(api.scanSessions.startSession);
  const updateSession = useMutation(api.scanSessions.updateSession);
  const completeSession = useMutation(api.scanSessions.completeSession);
  const cancelSession = useMutation(api.scanSessions.cancelSession);
  const generateUploadUrl = useMutation(api.physicalCookbooks.generateUploadUrl);
  const getOrCreateCookbook = useMutation(api.physicalCookbooks.getOrCreateByName);
  const saveScannedRecipe = useMutation(api.recipes.saveScannedRecipe);
  const processRecipeImage = useAction(api.actions.processRecipeImage.processRecipeImage);
  const extractCookbookName = useAction(api.actions.extractCookbookName.extractCookbookName);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setStep("cover");
      setBookName(existingCookbookName || "");
      setCoverImageUrl(null);
      setCoverImageId(null);
      setSessionId(null);
      setPhysicalCookbookId(existingCookbookId || null);
      setScannedRecipes([]);
      setCurrentRecipe(null);
      setMultiPageData([]);
      setIsMultiPage(false);
      setIsProcessing(false);
      setShowEditForm(false);
      setIsCoverCapture(false);
      setError(null);
    }
  }, [visible, existingCookbookId, existingCookbookName]);

  /**
   * Handle cover photo capture
   */
  const handleCoverCapture = useCallback(async (imageBase64: string, mimeType: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Upload image to storage
      const uploadUrl = await generateUploadUrl();

      // Convert base64 to blob
      const response = await fetch(`data:${mimeType};base64,${imageBase64}`);
      const blob = await response.blob();

      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": mimeType },
        body: blob,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload cover image");
      }

      const { storageId } = await uploadResult.json();
      setCoverImageId(storageId);

      // Get URL for display
      // For now, use the base64 directly for preview
      setCoverImageUrl(`data:${mimeType};base64,${imageBase64}`);

      // Extract cookbook name from cover
      const nameResult = await extractCookbookName({
        imageBase64,
        mimeType,
      });

      if (nameResult.success && nameResult.name) {
        setBookName(nameResult.name);
      }

      // Create or get cookbook
      const cookbookId = await getOrCreateCookbook({
        name: nameResult.success && nameResult.name ? nameResult.name : bookName || "Untitled Cookbook",
        coverImageId: storageId,
      });
      setPhysicalCookbookId(cookbookId);

      // Start session
      const newSessionId = await startSession({
        bookName: nameResult.success && nameResult.name ? nameResult.name : bookName || "Untitled Cookbook",
        physicalCookbookId: cookbookId,
        coverImageId: storageId,
      });
      setSessionId(newSessionId);

      // Move to scanning
      setStep("scanning");
    } catch (err) {
      console.error("Cover capture error:", err);
      setError({
        type: "UPLOAD_ERROR",
        message: "Failed to process cover photo. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      setIsCoverCapture(false);
    }
  }, [bookName, generateUploadUrl, extractCookbookName, getOrCreateCookbook, startSession]);

  /**
   * Handle skip cover
   */
  const handleSkipCover = useCallback(async () => {
    setIsProcessing(true);

    try {
      // Create or get cookbook if name provided
      let cookbookId = physicalCookbookId;
      if (bookName && !cookbookId) {
        cookbookId = await getOrCreateCookbook({ name: bookName });
        setPhysicalCookbookId(cookbookId);
      }

      // Start session
      const newSessionId = await startSession({
        bookName: bookName || "Untitled Cookbook",
        physicalCookbookId: cookbookId ?? undefined,
      });
      setSessionId(newSessionId);

      // Move to scanning
      setStep("scanning");
    } catch (err) {
      console.error("Skip cover error:", err);
      setError({
        type: "SESSION_ERROR",
        message: "Failed to start scanning session.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [bookName, physicalCookbookId, getOrCreateCookbook, startSession]);

  /**
   * Handle recipe page capture
   */
  const handleRecipeCapture = useCallback(async (imageBase64: string, mimeType: string) => {
    setIsProcessing(true);
    setStep("processing");
    setError(null);

    try {
      // Process image with Gemini
      const result = await processRecipeImage({
        imageBase64,
        mimeType,
      });

      if (!result.success || !result.data) {
        setError({
          type: result.error?.type || "EXTRACTION_FAILED",
          message: result.error?.message || "Failed to extract recipe from image.",
        });
        setStep("scanning");
        return;
      }

      // If multi-page, add to page data
      if (isMultiPage) {
        const pageNumber = multiPageData.length + 2; // +2 because first page is 1
        setMultiPageData((prev) => [
          ...prev,
          { pageNumber, extractedData: result.data! },
        ]);
      }

      setCurrentRecipe(result.data);
      setStep("review");
    } catch (err) {
      console.error("Recipe capture error:", err);
      setError({
        type: "PROCESSING_ERROR",
        message: "Failed to process recipe page. Please try again.",
      });
      setStep("scanning");
    } finally {
      setIsProcessing(false);
    }
  }, [isMultiPage, multiPageData.length, processRecipeImage]);

  /**
   * Handle edit details
   */
  const handleEditDetails = useCallback(() => {
    setShowEditForm(true);
  }, []);

  /**
   * Handle continue recipe (multi-page)
   */
  const handleContinueRecipe = useCallback(() => {
    if (currentRecipe) {
      // Save current page data
      if (!isMultiPage) {
        setMultiPageData([{ pageNumber: 1, extractedData: currentRecipe }]);
        setIsMultiPage(true);
      }
    }
    setStep("scanning");
  }, [currentRecipe, isMultiPage]);

  /**
   * Handle save recipe
   */
  const handleSaveRecipe = useCallback(async (recipe: ExtractedRecipeData) => {
    setIsProcessing(true);

    try {
      // Merge multi-page if needed
      let finalRecipe = recipe;
      if (isMultiPage && multiPageData.length > 0) {
        const pages: PageRecipeData[] = [
          ...multiPageData.map((p) => ({
            title: p.extractedData.title,
            ingredients: p.extractedData.ingredients,
            instructions: p.extractedData.instructions,
            servings: p.extractedData.servings,
            prepTime: p.extractedData.prepTime,
            cookTime: p.extractedData.cookTime,
            pageNumber: p.extractedData.pageNumber,
          })),
          {
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            servings: recipe.servings,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            pageNumber: recipe.pageNumber,
          },
        ];
        const merged = mergeMultiPageRecipe(pages);
        finalRecipe = {
          ...merged,
          pageNumber: merged.pageNumber || null,
        };
      }

      // Save to database
      const recipeId = await saveScannedRecipe({
        title: finalRecipe.title,
        ingredients: finalRecipe.ingredients,
        instructions: finalRecipe.instructions,
        servings: finalRecipe.servings,
        prepTime: finalRecipe.prepTime,
        cookTime: finalRecipe.cookTime,
        physicalCookbookId: physicalCookbookId ?? undefined,
        pageNumber: finalRecipe.pageNumber ?? undefined,
        sessionId: sessionId ?? undefined,
      });

      // Add to scanned recipes list
      setScannedRecipes((prev) => [
        ...prev,
        {
          _id: recipeId,
          title: finalRecipe.title,
          ingredientCount: finalRecipe.ingredients.length,
          instructionCount: finalRecipe.instructions.length,
        },
      ]);

      // Reset for next recipe
      setCurrentRecipe(null);
      setMultiPageData([]);
      setIsMultiPage(false);
      setShowEditForm(false);
      setStep("review");
    } catch (err) {
      console.error("Save recipe error:", err);
      Alert.alert("Error", "Failed to save recipe. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [isMultiPage, multiPageData, physicalCookbookId, sessionId, saveScannedRecipe]);

  /**
   * Handle scan another
   */
  const handleScanAnother = useCallback(async () => {
    // Save current recipe first if exists
    if (currentRecipe && !showEditForm) {
      await handleSaveRecipe(currentRecipe);
    }
    setCurrentRecipe(null);
    setMultiPageData([]);
    setIsMultiPage(false);
    setShowEditForm(false);
    setStep("scanning");
  }, [currentRecipe, showEditForm, handleSaveRecipe]);

  /**
   * Handle done scanning
   */
  const handleDoneScanning = useCallback(async () => {
    // Save current recipe first if exists
    if (currentRecipe && !showEditForm) {
      await handleSaveRecipe(currentRecipe);
    }

    // Complete session
    if (sessionId) {
      try {
        await completeSession({ sessionId });
      } catch (err) {
        console.error("Complete session error:", err);
      }
    }

    setStep("complete");
  }, [currentRecipe, showEditForm, sessionId, handleSaveRecipe, completeSession]);

  /**
   * Handle scan more from this book
   */
  const handleScanMore = useCallback(() => {
    setCurrentRecipe(null);
    setMultiPageData([]);
    setIsMultiPage(false);
    setShowEditForm(false);
    setStep("scanning");
  }, []);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(async () => {
    // Cancel session if active
    if (sessionId) {
      try {
        await cancelSession({ sessionId });
      } catch (err) {
        // Ignore errors on cancel
      }
    }
    onClose();
  }, [sessionId, cancelSession, onClose]);

  /**
   * Handle enter manually fallback
   */
  const handleEnterManually = useCallback((partialData: Partial<ExtractedRecipeData>) => {
    // TODO: Navigate to manual recipe creation with partial data
    Alert.alert(
      "Manual Entry",
      "Manual recipe creation will be opened with the extracted data pre-filled."
    );
    setShowEditForm(false);
  }, []);

  /**
   * Handle retry after error
   */
  const handleRetry = useCallback(() => {
    setError(null);
    if (step === "processing") {
      setStep("scanning");
    }
  }, [step]);

  // Determine header title
  const getHeaderTitle = () => {
    if (isCoverCapture) return "Capture Cover";
    switch (step) {
      case "cover":
        return "Scan Cookbook";
      case "scanning":
        return "Scan Recipe";
      case "processing":
        return "Processing...";
      case "review":
        return "Review Recipe";
      case "complete":
        return "Complete";
      default:
        return "Scan Cookbook";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-stone-950">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-stone-800 px-4 py-4 pt-12">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-800"
          >
            <X size={24} color="#a8a29e" />
          </Pressable>
          <Text className="text-lg font-semibold text-white">
            {getHeaderTitle()}
          </Text>
          <View className="w-10" />
        </View>

        {/* Error State */}
        {error && (
          <View className="m-4 flex-row items-center gap-3 rounded-xl bg-red-500/20 p-4">
            <AlertCircle size={24} color="#ef4444" />
            <View className="flex-1">
              <Text className="font-medium text-red-500">{error.type}</Text>
              <Text className="text-sm text-red-400">{error.message}</Text>
            </View>
            <Pressable
              onPress={handleRetry}
              className="rounded-lg bg-red-500/20 px-3 py-2 active:bg-red-500/30"
            >
              <RotateCcw size={18} color="#ef4444" />
            </Pressable>
          </View>
        )}

        {/* Cover Capture Mode */}
        {isCoverCapture && (
          <CameraViewfinder
            onCapture={handleCoverCapture}
            isProcessing={isProcessing}
            guidanceMessage="Position the cookbook cover in the frame"
          />
        )}

        {/* Edit Form */}
        {showEditForm && currentRecipe && (
          <ScannedRecipeEditForm
            recipe={currentRecipe}
            onSave={handleSaveRecipe}
            onCancel={() => setShowEditForm(false)}
            onEnterManually={handleEnterManually}
          />
        )}

        {/* Step Content */}
        {!isCoverCapture && !showEditForm && (
          <>
            {step === "cover" && (
              <CoverStep
                bookName={bookName}
                onBookNameChange={setBookName}
                onCaptureCover={() => setIsCoverCapture(true)}
                onSkip={handleSkipCover}
              />
            )}

            {step === "scanning" && (
              <ScanningStep
                bookName={bookName}
                coverImageUrl={coverImageUrl}
                scannedRecipeCount={scannedRecipes.length}
                onCapture={handleRecipeCapture}
                onDone={handleDoneScanning}
                isProcessing={isProcessing}
              />
            )}

            {step === "processing" && (
              <ProcessingStep
                message={isMultiPage ? `Extracting page ${multiPageData.length + 2}...` : undefined}
              />
            )}

            {step === "review" && currentRecipe && (
              <ReviewStep
                recipe={currentRecipe}
                isMultiPage={isMultiPage}
                pageCount={multiPageData.length + 1}
                scannedRecipes={scannedRecipes}
                onEditDetails={handleEditDetails}
                onContinueRecipe={handleContinueRecipe}
                onScanAnother={handleScanAnother}
                onDoneScanning={handleDoneScanning}
              />
            )}

            {step === "complete" && (
              <CompleteStep
                bookName={bookName}
                coverImageUrl={coverImageUrl}
                scannedRecipes={scannedRecipes}
                onScanMore={handleScanMore}
                onDone={handleClose}
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
}
