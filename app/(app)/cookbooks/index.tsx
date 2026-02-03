/**
 * Cookbooks List Screen
 *
 * Displays all user cookbooks with Quick Access (built-in) and My Cookbooks sections.
 * Supports grid/list view toggle and cookbook management.
 */

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, Star } from "lucide-react-native";

import {
  CookbookCard,
  NewCookbookCard,
  EmptyState,
  ViewModeToggle,
  CreateCookbookModal,
  EditCookbookModal,
  DeleteConfirmationDialog,
  type ViewMode,
} from "@/components/cookbooks";
import { TabBar } from "@/components/navigation";

export default function CookbooksScreen() {
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCookbookId, setEditCookbookId] = useState<Id<"cookbooks"> | null>(
    null
  );
  const [deleteCookbook, setDeleteCookbook] = useState<{
    id: Id<"cookbooks">;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch cookbooks
  const cookbooks = useQuery(api.cookbooks.listCookbooks);
  const deleteCookbookMutation = useMutation(api.cookbooks.deleteCookbook);

  const isLoading = cookbooks === undefined;

  // Separate built-in and user cookbooks
  const builtInCookbooks = useMemo(
    () => cookbooks?.filter((c) => c.isBuiltIn) ?? [],
    [cookbooks]
  );

  const userCookbooks = useMemo(
    () => cookbooks?.filter((c) => !c.isBuiltIn) ?? [],
    [cookbooks]
  );

  const totalCount = cookbooks?.length ?? 0;

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const handleViewCookbook = useCallback(
    (cookbookId: Id<"cookbooks">) => {
      router.push(`/(app)/cookbooks/${cookbookId}`);
    },
    [router]
  );

  const handleEditCookbook = useCallback((cookbookId: Id<"cookbooks">) => {
    setEditCookbookId(cookbookId);
  }, []);

  const handleDeleteCookbook = useCallback(
    (cookbookId: Id<"cookbooks">, name: string) => {
      setDeleteCookbook({ id: cookbookId, name });
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteCookbook) return;

    setIsDeleting(true);
    try {
      await deleteCookbookMutation({ id: deleteCookbook.id });
      setDeleteCookbook(null);
    } catch (error) {
      console.error("Failed to delete cookbook:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteCookbook, deleteCookbookMutation]);

  const handleShareCookbook = useCallback((cookbookId: Id<"cookbooks">) => {
    // TODO: Implement share functionality
    console.log("Share cookbook:", cookbookId);
  }, []);

  // Render section header
  const renderSectionHeader = (title: string, icon?: React.ReactNode) => (
    <View className="mb-4 flex-row items-center gap-2">
      {icon}
      <Text className="text-lg font-bold text-stone-900 dark:text-white">
        {title}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="border-b border-stone-200 bg-white px-4 pb-4 pt-12 dark:border-stone-800 dark:bg-stone-900">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-stone-900 dark:text-white">
              Cookbooks
            </Text>
            <Text className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              {totalCount} {totalCount === 1 ? "cookbook" : "cookbooks"}
            </Text>
          </View>

          {/* Create Button */}
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="flex-row items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 shadow-sm active:bg-orange-600"
          >
            <Plus className="h-5 w-5 text-white" />
            <Text className="font-semibold text-white">New Cookbook</Text>
          </Pressable>
        </View>

        {/* View Toggle */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setViewMode("grid")}
            className={`flex-row items-center gap-2 rounded-lg px-3 py-1.5 ${
              viewMode === "grid"
                ? "bg-orange-500"
                : "bg-stone-100 dark:bg-stone-800"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "grid"
                  ? "text-white"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              Grid
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("list")}
            className={`flex-row items-center gap-2 rounded-lg px-3 py-1.5 ${
              viewMode === "list"
                ? "bg-orange-500"
                : "bg-stone-100 dark:bg-stone-800"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "list"
                  ? "text-white"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              List
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={[]}
        renderItem={() => null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#f97316"
          />
        }
        ListHeaderComponent={
          <View className="px-4 py-6">
            {/* Quick Access Section */}
            {builtInCookbooks.length > 0 && (
              <View className="mb-8">
                {renderSectionHeader(
                  "Quick Access",
                  <Star className="h-5 w-5 text-orange-500" fill="#f97316" />
                )}
                {viewMode === "grid" ? (
                  <View className="flex-row flex-wrap gap-4">
                    {builtInCookbooks.map((cookbook) => (
                      <View key={cookbook._id} className="w-[48%]">
                        <CookbookCard
                          cookbook={cookbook}
                          viewMode={viewMode}
                          onView={() => handleViewCookbook(cookbook._id)}
                          onEdit={() => handleEditCookbook(cookbook._id)}
                          onShare={() => handleShareCookbook(cookbook._id)}
                        />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="gap-2">
                    {builtInCookbooks.map((cookbook) => (
                      <CookbookCard
                        key={cookbook._id}
                        cookbook={cookbook}
                        viewMode={viewMode}
                        onView={() => handleViewCookbook(cookbook._id)}
                        onEdit={() => handleEditCookbook(cookbook._id)}
                        onShare={() => handleShareCookbook(cookbook._id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* My Cookbooks Section */}
            <View>
              {renderSectionHeader("My Cookbooks")}
              {userCookbooks.length === 0 ? (
                <EmptyState onCreateCookbook={() => setShowCreateModal(true)} />
              ) : viewMode === "grid" ? (
                <View className="flex-row flex-wrap gap-4">
                  {userCookbooks.map((cookbook) => (
                    <View key={cookbook._id} className="w-[48%]">
                      <CookbookCard
                        cookbook={cookbook}
                        viewMode={viewMode}
                        onView={() => handleViewCookbook(cookbook._id)}
                        onEdit={() => handleEditCookbook(cookbook._id)}
                        onDelete={() =>
                          handleDeleteCookbook(cookbook._id, cookbook.name)
                        }
                        onShare={() => handleShareCookbook(cookbook._id)}
                      />
                    </View>
                  ))}
                  <View className="w-[48%]">
                    <NewCookbookCard onPress={() => setShowCreateModal(true)} />
                  </View>
                </View>
              ) : (
                <View className="gap-2">
                  {userCookbooks.map((cookbook) => (
                    <CookbookCard
                      key={cookbook._id}
                      cookbook={cookbook}
                      viewMode={viewMode}
                      onView={() => handleViewCookbook(cookbook._id)}
                      onEdit={() => handleEditCookbook(cookbook._id)}
                      onDelete={() =>
                        handleDeleteCookbook(cookbook._id, cookbook.name)
                      }
                      onShare={() => handleShareCookbook(cookbook._id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        }
      />

      {/* Modals */}
      <CreateCookbookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(id) => {
          setShowCreateModal(false);
          handleViewCookbook(id as Id<"cookbooks">);
        }}
      />

      <EditCookbookModal
        isOpen={editCookbookId !== null}
        cookbookId={editCookbookId}
        onClose={() => setEditCookbookId(null)}
      />

      <DeleteConfirmationDialog
        isOpen={deleteCookbook !== null}
        cookbookName={deleteCookbook?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCookbook(null)}
      />

      {/* Bottom Tab Bar */}
      <TabBar />
    </View>
  );
}
