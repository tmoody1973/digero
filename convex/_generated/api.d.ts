/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_convertRecipeDiet from "../actions/convertRecipeDiet.js";
import type * as actions_extractCookbookName from "../actions/extractCookbookName.js";
import type * as actions_extractRecipeFromUrl from "../actions/extractRecipeFromUrl.js";
import type * as actions_extractRecipeWithGemini from "../actions/extractRecipeWithGemini.js";
import type * as actions_fetchRecipeUrl from "../actions/fetchRecipeUrl.js";
import type * as actions_generateCookbookCover from "../actions/generateCookbookCover.js";
import type * as actions_generateRecipeChat from "../actions/generateRecipeChat.js";
import type * as actions_generateRecipeImage from "../actions/generateRecipeImage.js";
import type * as actions_generateSpeechmaticsJWT from "../actions/generateSpeechmaticsJWT.js";
import type * as actions_processRecipeImage from "../actions/processRecipeImage.js";
import type * as actions_sendCreatorMessage from "../actions/sendCreatorMessage.js";
import type * as actions_sendRecipeToInstacart from "../actions/sendRecipeToInstacart.js";
import type * as actions_sendToInstacart from "../actions/sendToInstacart.js";
import type * as actions_uploadPlaceholderImage from "../actions/uploadPlaceholderImage.js";
import type * as actions_youtube_addFeaturedChannel from "../actions/youtube/addFeaturedChannel.js";
import type * as actions_youtube_cacheChannelVideos from "../actions/youtube/cacheChannelVideos.js";
import type * as actions_youtube_extractRecipeFromYouTube from "../actions/youtube/extractRecipeFromYouTube.js";
import type * as actions_youtube_fetchCaptions from "../actions/youtube/fetchCaptions.js";
import type * as actions_youtube_fetchChannelData from "../actions/youtube/fetchChannelData.js";
import type * as actions_youtube_fetchVideoMetadata from "../actions/youtube/fetchVideoMetadata.js";
import type * as actions_youtube_index from "../actions/youtube/index.js";
import type * as actions_youtube_refreshChannelBanner from "../actions/youtube/refreshChannelBanner.js";
import type * as actions_youtube_seedFeaturedChannelsAction from "../actions/youtube/seedFeaturedChannelsAction.js";
import type * as aiChat from "../aiChat.js";
import type * as aiChatCleanup from "../aiChatCleanup.js";
import type * as aiChatUsage from "../aiChatUsage.js";
import type * as channels from "../channels.js";
import type * as cookbooks from "../cookbooks.js";
import type * as creator from "../creator.js";
import type * as creatorMessaging from "../creatorMessaging.js";
import type * as creatorSchema from "../creatorSchema.js";
import type * as creatorShop from "../creatorShop.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as internalMutations from "../internalMutations.js";
import type * as lib_aiRecipeTransform from "../lib/aiRecipeTransform.js";
import type * as lib_categoryAssignment from "../lib/categoryAssignment.js";
import type * as lib_chatCleanup from "../lib/chatCleanup.js";
import type * as lib_ingredientAggregation from "../lib/ingredientAggregation.js";
import type * as lib_instacartUtils from "../lib/instacartUtils.js";
import type * as lib_multiPageMerge from "../lib/multiPageMerge.js";
import type * as lib_onesignalUtils from "../lib/onesignalUtils.js";
import type * as lib_parseJsonLdRecipe from "../lib/parseJsonLdRecipe.js";
import type * as lib_parseMicrodataRecipe from "../lib/parseMicrodataRecipe.js";
import type * as lib_recipeTypes from "../lib/recipeTypes.js";
import type * as lib_unitConversion from "../lib/unitConversion.js";
import type * as lib_youtubeTypes from "../lib/youtubeTypes.js";
import type * as lib_youtubeUrlParser from "../lib/youtubeUrlParser.js";
import type * as mealPlanner from "../mealPlanner.js";
import type * as migrations_migrateMessagesToSessions from "../migrations/migrateMessagesToSessions.js";
import type * as mutations_seedDemoData from "../mutations/seedDemoData.js";
import type * as physicalCookbooks from "../physicalCookbooks.js";
import type * as recipes from "../recipes.js";
import type * as scanSessions from "../scanSessions.js";
import type * as seed_creatorDemo from "../seed/creatorDemo.js";
import type * as seedFeaturedChannels from "../seedFeaturedChannels.js";
import type * as seedFeaturedChannelsMutation from "../seedFeaturedChannelsMutation.js";
import type * as shoppingLists from "../shoppingLists.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as youtubeQuota from "../youtubeQuota.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/convertRecipeDiet": typeof actions_convertRecipeDiet;
  "actions/extractCookbookName": typeof actions_extractCookbookName;
  "actions/extractRecipeFromUrl": typeof actions_extractRecipeFromUrl;
  "actions/extractRecipeWithGemini": typeof actions_extractRecipeWithGemini;
  "actions/fetchRecipeUrl": typeof actions_fetchRecipeUrl;
  "actions/generateCookbookCover": typeof actions_generateCookbookCover;
  "actions/generateRecipeChat": typeof actions_generateRecipeChat;
  "actions/generateRecipeImage": typeof actions_generateRecipeImage;
  "actions/generateSpeechmaticsJWT": typeof actions_generateSpeechmaticsJWT;
  "actions/processRecipeImage": typeof actions_processRecipeImage;
  "actions/sendCreatorMessage": typeof actions_sendCreatorMessage;
  "actions/sendRecipeToInstacart": typeof actions_sendRecipeToInstacart;
  "actions/sendToInstacart": typeof actions_sendToInstacart;
  "actions/uploadPlaceholderImage": typeof actions_uploadPlaceholderImage;
  "actions/youtube/addFeaturedChannel": typeof actions_youtube_addFeaturedChannel;
  "actions/youtube/cacheChannelVideos": typeof actions_youtube_cacheChannelVideos;
  "actions/youtube/extractRecipeFromYouTube": typeof actions_youtube_extractRecipeFromYouTube;
  "actions/youtube/fetchCaptions": typeof actions_youtube_fetchCaptions;
  "actions/youtube/fetchChannelData": typeof actions_youtube_fetchChannelData;
  "actions/youtube/fetchVideoMetadata": typeof actions_youtube_fetchVideoMetadata;
  "actions/youtube/index": typeof actions_youtube_index;
  "actions/youtube/refreshChannelBanner": typeof actions_youtube_refreshChannelBanner;
  "actions/youtube/seedFeaturedChannelsAction": typeof actions_youtube_seedFeaturedChannelsAction;
  aiChat: typeof aiChat;
  aiChatCleanup: typeof aiChatCleanup;
  aiChatUsage: typeof aiChatUsage;
  channels: typeof channels;
  cookbooks: typeof cookbooks;
  creator: typeof creator;
  creatorMessaging: typeof creatorMessaging;
  creatorSchema: typeof creatorSchema;
  creatorShop: typeof creatorShop;
  crons: typeof crons;
  http: typeof http;
  internalMutations: typeof internalMutations;
  "lib/aiRecipeTransform": typeof lib_aiRecipeTransform;
  "lib/categoryAssignment": typeof lib_categoryAssignment;
  "lib/chatCleanup": typeof lib_chatCleanup;
  "lib/ingredientAggregation": typeof lib_ingredientAggregation;
  "lib/instacartUtils": typeof lib_instacartUtils;
  "lib/multiPageMerge": typeof lib_multiPageMerge;
  "lib/onesignalUtils": typeof lib_onesignalUtils;
  "lib/parseJsonLdRecipe": typeof lib_parseJsonLdRecipe;
  "lib/parseMicrodataRecipe": typeof lib_parseMicrodataRecipe;
  "lib/recipeTypes": typeof lib_recipeTypes;
  "lib/unitConversion": typeof lib_unitConversion;
  "lib/youtubeTypes": typeof lib_youtubeTypes;
  "lib/youtubeUrlParser": typeof lib_youtubeUrlParser;
  mealPlanner: typeof mealPlanner;
  "migrations/migrateMessagesToSessions": typeof migrations_migrateMessagesToSessions;
  "mutations/seedDemoData": typeof mutations_seedDemoData;
  physicalCookbooks: typeof physicalCookbooks;
  recipes: typeof recipes;
  scanSessions: typeof scanSessions;
  "seed/creatorDemo": typeof seed_creatorDemo;
  seedFeaturedChannels: typeof seedFeaturedChannels;
  seedFeaturedChannelsMutation: typeof seedFeaturedChannelsMutation;
  shoppingLists: typeof shoppingLists;
  subscriptions: typeof subscriptions;
  users: typeof users;
  youtubeQuota: typeof youtubeQuota;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
