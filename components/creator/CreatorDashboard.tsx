/**
 * Creator Dashboard
 *
 * Main dashboard for partnered creators showing earnings,
 * engagement metrics, and quick actions.
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { router } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

interface CreatorDashboardProps {
  creatorId: string;
}

export function CreatorDashboard({ creatorId }: CreatorDashboardProps) {
  const stats = useQuery(api.creator.getCreatorStats, { creatorId });
  const earnings = useQuery(api.creator.getCreatorEarnings, { creatorId });
  const topRecipes = useQuery(api.creator.getTopRecipes, { creatorId, limit: 5 });

  if (!stats || !earnings) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-stone-50">
      {/* Header */}
      <View className="bg-orange-500 px-4 pt-12 pb-8">
        <Text className="text-white text-sm font-medium opacity-80">
          Creator Dashboard
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">
          Welcome back, {stats.channelName}
        </Text>
        <View className="flex-row items-center mt-2">
          <TierBadge tier={stats.tier} />
          <Text className="text-white text-sm ml-2 opacity-80">
            {stats.resMultiplier}x RES Multiplier
          </Text>
        </View>
      </View>

      {/* Earnings Card */}
      <View className="mx-4 -mt-4 bg-white rounded-2xl p-6 shadow-lg">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-stone-500 text-sm">Estimated This Month</Text>
            <Text className="text-3xl font-bold text-stone-900 mt-1">
              ${(earnings.estimatedPayout / 100).toFixed(2)}
            </Text>
            {earnings.percentChange !== 0 && (
              <View className="flex-row items-center mt-2">
                <Ionicons
                  name={earnings.percentChange > 0 ? "trending-up" : "trending-down"}
                  size={16}
                  color={earnings.percentChange > 0 ? "#22c55e" : "#ef4444"}
                />
                <Text
                  className={`text-sm ml-1 ${
                    earnings.percentChange > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {earnings.percentChange > 0 ? "+" : ""}
                  {earnings.percentChange.toFixed(1)}% vs last month
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => router.push("/creator/earnings")}
            className="bg-orange-100 px-3 py-2 rounded-lg"
          >
            <Text className="text-orange-600 text-sm font-medium">Details</Text>
          </Pressable>
        </View>

        {/* Mini Chart */}
        <View className="mt-4">
          <LineChart
            data={{
              labels: earnings.last7Days.map((d) => d.label),
              datasets: [{ data: earnings.last7Days.map((d) => d.amount / 100) }],
            }}
            width={screenWidth - 80}
            height={100}
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={false}
            withHorizontalLabels={false}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            bezier
            style={{ marginLeft: -16 }}
          />
        </View>

        {/* Revenue Breakdown */}
        <View className="flex-row mt-4 pt-4 border-t border-stone-100">
          <View className="flex-1">
            <Text className="text-stone-400 text-xs">Subscriptions</Text>
            <Text className="text-stone-900 font-semibold">
              ${(earnings.subscriptionShare / 100).toFixed(2)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-stone-400 text-xs">Shop Sales</Text>
            <Text className="text-stone-900 font-semibold">
              ${(earnings.shopCommission / 100).toFixed(2)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-stone-400 text-xs">Your RES Share</Text>
            <Text className="text-stone-900 font-semibold">
              {(earnings.resShare * 100).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="flex-row mx-4 mt-4 gap-3">
        <MetricCard
          icon="bookmark"
          label="Saves"
          value={formatNumber(stats.totalSaves)}
          change={stats.savesChange}
        />
        <MetricCard
          icon="flame"
          label="Cooks"
          value={formatNumber(stats.totalCooks)}
          change={stats.cooksChange}
        />
        <MetricCard
          icon="share"
          label="Shares"
          value={formatNumber(stats.totalShares)}
          change={stats.sharesChange}
        />
      </View>

      {/* RES Breakdown */}
      <View className="mx-4 mt-4 bg-white rounded-xl p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-stone-900 font-semibold">
            Recipe Engagement Score
          </Text>
          <Text className="text-orange-500 font-bold text-lg">
            {formatNumber(stats.totalRES)}
          </Text>
        </View>

        <RESBreakdown
          saves={stats.totalSaves}
          cooks={stats.totalCooks}
          shares={stats.totalShares}
          ratings={stats.totalRatings}
          exclusiveViews={stats.exclusiveViews}
        />

        <Text className="text-stone-400 text-xs mt-3">
          RES determines your share of the creator pool. Higher engagement = higher earnings.
        </Text>
      </View>

      {/* Top Performing Recipes */}
      <View className="mx-4 mt-4 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-stone-900 font-semibold">Top Recipes</Text>
          <Pressable onPress={() => router.push("/creator/recipes")}>
            <Text className="text-orange-500 text-sm">View All</Text>
          </Pressable>
        </View>

        {topRecipes?.map((recipe, index) => (
          <TopRecipeRow key={recipe._id} recipe={recipe} rank={index + 1} />
        ))}
      </View>

      {/* Quick Actions */}
      <View className="mx-4 mb-8">
        <Text className="text-stone-900 font-semibold mb-3">Quick Actions</Text>
        <View className="flex-row gap-3">
          <ActionButton
            icon="add-circle"
            label="Add Exclusive"
            onPress={() => router.push("/creator/recipes/new")}
          />
          <ActionButton
            icon="storefront"
            label="Manage Shop"
            onPress={() => router.push("/creator/shop")}
          />
          <ActionButton
            icon="stats-chart"
            label="Analytics"
            onPress={() => router.push("/creator/analytics")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function TierBadge({ tier }: { tier: string }) {
  const config = {
    emerging: { bg: "bg-white/20", text: "Emerging Creator" },
    established: { bg: "bg-yellow-400", text: "Established Creator" },
    partner: { bg: "bg-purple-500", text: "Partner Creator" },
  };

  const { bg, text } = config[tier as keyof typeof config] || config.emerging;

  return (
    <View className={`${bg} px-2 py-1 rounded-full`}>
      <Text className="text-white text-xs font-medium">{text}</Text>
    </View>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  change: number;
}) {
  return (
    <View className="flex-1 bg-white rounded-xl p-4">
      <Ionicons name={icon} size={20} color="#a8a29e" />
      <Text className="text-2xl font-bold text-stone-900 mt-2">{value}</Text>
      <Text className="text-stone-500 text-xs">{label}</Text>
      {change !== 0 && (
        <Text
          className={`text-xs mt-1 ${change > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(0)}%
        </Text>
      )}
    </View>
  );
}

function RESBreakdown({
  saves,
  cooks,
  shares,
  ratings,
  exclusiveViews,
}: {
  saves: number;
  cooks: number;
  shares: number;
  ratings: number;
  exclusiveViews: number;
}) {
  const items = [
    { label: "Saves", value: saves, points: saves * 1, multiplier: "×1" },
    { label: "Cooks", value: cooks, points: cooks * 5, multiplier: "×5" },
    { label: "Shares", value: shares, points: shares * 3, multiplier: "×3" },
    { label: "Ratings", value: ratings, points: ratings * 2, multiplier: "×2" },
    { label: "Exclusive Views", value: exclusiveViews, points: exclusiveViews * 2, multiplier: "×2" },
  ];

  const total = items.reduce((sum, item) => sum + item.points, 0);

  return (
    <View className="space-y-2">
      {items.map((item) => (
        <View key={item.label} className="flex-row items-center">
          <Text className="text-stone-500 text-sm w-28">{item.label}</Text>
          <View className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${(item.points / total) * 100}%` }}
            />
          </View>
          <Text className="text-stone-400 text-xs w-8 text-right">
            {item.multiplier}
          </Text>
          <Text className="text-stone-700 text-sm w-16 text-right font-medium">
            {formatNumber(item.points)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TopRecipeRow({
  recipe,
  rank,
}: {
  recipe: {
    _id: string;
    title: string;
    imageUrl: string;
    engagementScore: number;
    saves: number;
    cooks: number;
  };
  rank: number;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/creator/recipes/${recipe._id}`)}
      className="flex-row items-center bg-white rounded-xl p-3 mb-2"
    >
      <Text className="text-stone-400 font-bold w-6">#{rank}</Text>
      <View
        className="w-12 h-12 rounded-lg bg-stone-200 mr-3"
        style={{
          backgroundImage: `url(${recipe.imageUrl})`,
        }}
      />
      <View className="flex-1">
        <Text className="text-stone-900 font-medium" numberOfLines={1}>
          {recipe.title}
        </Text>
        <Text className="text-stone-400 text-xs">
          {formatNumber(recipe.saves)} saves · {formatNumber(recipe.cooks)} cooks
        </Text>
      </View>
      <Text className="text-orange-500 font-bold">
        {formatNumber(recipe.engagementScore)}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-white rounded-xl p-4 items-center"
    >
      <Ionicons name={icon} size={24} color="#f97316" />
      <Text className="text-stone-700 text-xs mt-2 text-center">{label}</Text>
    </Pressable>
  );
}

// =============================================================================
// Utilities
// =============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
