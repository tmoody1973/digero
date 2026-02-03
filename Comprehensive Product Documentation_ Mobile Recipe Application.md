# Comprehensive Product Documentation: Mobile Recipe Application

**Author:** Manus AI  
**Date:** February 2, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Overview](#2-design-overview)
3. [Market Analysis & Business Strategy](#3-market-analysis--business-strategy)
4. [Complete Feature List](#4-complete-feature-list)
5. [Technical Research & Architecture](#5-technical-research--architecture)
6. [API Integration Strategy](#6-api-integration-strategy)
7. [Product Requirements Document (PRD)](#7-product-requirements-document-prd)
8. [Nutrition Analysis System](#8-nutrition-analysis-system)
9. [Data Model & Database Schema](#9-data-model--database-schema)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [TestFlight Deployment](#11-testflight-deployment)
12. [References](#12-references)

---

## 1. Executive Summary

This document provides a comprehensive blueprint for building a mobile recipe application for iOS, designed to participate in the RevenueCat Shipyard 2026 hackathon. The app directly addresses the brief provided by creator Eitan Bernath, aiming to help users transition from culinary inspiration to home-cooked meals. The application will be built using React Native and Expo for rapid development and deployment, with a Convex backend for real-time data synchronization and Clerk for secure user authentication. A key new feature is the ability for users to scan recipes from physical cookbooks using their device's camera, with the app automatically extracting and digitizing the recipe. Monetization will be handled through RevenueCat, with a simple and effective pricing model. This document outlines the product vision, technical architecture, feature set, and go-to-market strategy for this innovative mobile application.

---

## 2. Design Overview

The application will feature a modern, mobile-first design, adapting the **bento box layout** for a smaller screen to create an intuitive and engaging user experience. The vibrant, food-themed color palette from the original concept will be retained to evoke warmth and freshness.

### 2.1. Color Palette

*   **Primary Orange (#ea580c):** Represents cooking fire and energy
*   **Fresh Green (#16a34a):** Represents herbs and healthy ingredients
*   **Golden Yellow (#eab308):** Represents butter and warmth
*   **Soft Warm White:** Background for a clean, inviting feel

### 2.2. Key Screens and Layout

The application will be organized into several key screens, each designed with the bento grid principle for clarity and ease of navigation on a mobile device:

**Homepage:** A scrollable dashboard with bento-style cards for quick access to "My Cookbooks", "Meal Planner", "Shopping Lists", and a prominent "Scan Recipe" button.

**Recipe Detail Screen:** This screen will display the recipe's title, image, ingredients, and instructions in a clear, easy-to-read format. For video recipes, an embedded player will be available. For scanned recipes, the original photo can be viewed.

**Scan Recipe Screen:** This screen will activate the device's camera, allowing the user to take a photo of a recipe. After the photo is taken, the app will display the extracted text for the user to review and edit before saving.

**Meal Plan Screen:** A weekly calendar view optimized for mobile, displaying meals for each day. Users can drag and drop recipes from their cookbooks onto the calendar.

**Shopping List Screen:** Ingredients will be grouped by category, with checkboxes for easy tracking. The list can be shared or exported.

---

## 3. Market Analysis & Business Strategy

### 3.1. Market Opportunity

The app targets a clear need within the vast market of online food content consumers. Eitan Bernath's brief highlights a common user pain point: the gap between finding recipe inspiration and actually cooking the meal. By providing tools to bridge this gap, the app has a strong value proposition for a large and engaged audience.

### 3.2. User Personas

In line with Eitan Bernath's audience, we will target the following personas:

*   **The Ambitious Novice:** Young, enthusiastic home cooks who are eager to learn but need guidance and organization to turn their culinary aspirations into reality. They are active on social media and look to creators like Eitan for inspiration.
*   **The Busy Parent:** Time-strapped parents who want to cook healthy and delicious meals for their families but struggle with meal planning and grocery shopping. They value efficiency and convenience.
*   **The Creative Foodie:** Experienced home cooks who enjoy experimenting with new recipes but need a better way to organize their collection, which includes a mix of online finds and physical cookbooks.

### 3.3. Pricing Strategy with RevenueCat

To meet the hackathon's requirement of using RevenueCat for monetization, we will implement a freemium model with a single, compelling subscription tier.

| Tier | Monthly Price | Annual Price | Key Features |
|---|---|---|---|
| **Free** | $0 | $0 | Save up to 10 recipes, 3 cookbook photo scans per month, basic meal planning |
| **Premium** | $4.99 | $49.99 | Unlimited recipes, unlimited cookbook photo scans, advanced meal planning, grocery list export, and access to exclusive content |

This pricing strategy provides a low barrier to entry with the free tier, while the premium tier offers significant value for engaged users, encouraging conversion.

---

## 4. Complete Feature List

### 4.1. Core Features

*   **Recipe Management:** Save recipes from YouTube, websites, and now, physical cookbooks.
*   **Cookbook Organization:** Create custom cookbooks to organize recipes by theme or occasion.
*   **Meal Planning:** Plan weekly meals using a drag-and-drop calendar.
*   **Shopping List Generation:** Automatically generate shopping lists from meal plans.

### 4.2. New Feature: Cookbook Photo Scanning

*   **Camera-based Scanning:** Use the device's camera to take a photo of a recipe from a cookbook or magazine.
*   **OCR and AI Extraction:** Utilize OCR and AI to extract the recipe's title, ingredients, and instructions from the image.
*   **Review and Edit:** Allow users to review and edit the extracted recipe before saving it to their cookbook.

---

## 5. Technical Research & Architecture

### 5.1. Tech Stack

*   **Frontend:** React Native with Expo
*   **Backend:** Convex
*   **Authentication:** Clerk
*   **Monetization:** RevenueCat
*   **OCR for Recipe Scanning:** Gemini API

### 5.2. Architecture

The application will be built as a client-server application. The React Native/Expo frontend will communicate with the Convex backend for data storage and real-time updates. Clerk will handle user authentication, and RevenueCat will manage in-app purchases and subscriptions. For the cookbook scanning feature, the mobile app will send the image to a serverless function that uses the Gemini API to perform OCR and return the extracted text.

---

## 6. API Integration Strategy

*   **Convex:** The Convex client library for React Native will be used for all database interactions, providing real-time data synchronization between the app and the backend.
*   **Clerk:** The Clerk React Native SDK will be used to handle user sign-up, sign-in, and session management. Clerk will be integrated with Convex to sync user data.
*   **RevenueCat:** The `react-native-purchases` SDK will be integrated to manage in-app purchases and subscriptions. The app will use RevenueCat's API to fetch product offerings and verify purchases.
*   **Gemini API:** A REST API call will be made from a serverless function to the Gemini API, sending the recipe image and receiving the extracted text.

---

## 7. Product Requirements Document (PRD)

### 7.1. Product Vision

To create the ultimate tool for home cooks to turn culinary inspiration into delicious, home-cooked meals, with a seamless experience from recipe discovery to the dinner table.

### 7.2. User Workflow

1.  User discovers a recipe (on YouTube, a website, or in a cookbook).
2.  User saves the recipe to the app (via link or by taking a photo).
3.  The app extracts and organizes the recipe.
4.  User adds the recipe to a meal plan.
5.  The app generates a shopping list for the meal plan.
6.  User goes grocery shopping with the organized list.
7.  User cooks the meal with the easy-to-follow recipe in the app.

---

## 8. Nutrition Analysis System

The existing nutrition analysis system, which uses Edamam's API, will be retained. This feature adds significant value and can be a key differentiator for the premium subscription tier.

---

## 9. Data Model & Database Schema

The database schema will be adapted for the Convex backend. The core tables will remain similar, with the addition of fields to support the new features.

**recipes**
*   `id` (string, Convex ID)
*   `userId` (string, Clerk user ID)
*   `title` (string)
*   `source` (string, e.g., 'youtube', 'web', 'cookbook')
*   `sourceUrl` (string, optional)
*   `imageUrl` (string, optional)
*   `ingredients` (array of strings)
*   `instructions` (array of strings)
*   `servings` (number)
*   `notes` (string)

---

## 10. Implementation Roadmap

### 10.1. MVP (4 Weeks for Hackathon)

*   User authentication with Clerk.
*   Save recipes from YouTube and websites.
*   Cookbook photo scanning feature.
*   Basic meal planning.
*   Shopping list generation.
*   RevenueCat integration with a simple subscription model.
*   Deployment to TestFlight.

### 10.2. V1 (Post-Hackathon)

*   Android version of the app.
*   Advanced meal planning features (e.g., dietary filters, nutritional information).
*   Grocery delivery integration (e.g., Instacart).
*   Social features (e.g., sharing cookbooks and meal plans).

---

## 11. TestFlight Deployment

For the hackathon, the iOS app will be deployed to TestFlight for testing and submission. This will be accomplished using Expo Application Services (EAS) and the `npx testflight` command.

### Deployment Process

1.  **Prerequisites:** A paid Apple Developer account and an Expo account are required.
2.  **Run Command:** In the project's root directory, run the command `npx testflight`.
3.  **Interactive Workflow:** The command will guide through the following steps:
    *   Initialize or detect an EAS project.
    *   Confirm the app's bundle identifier.
    *   Sign in to the Apple Developer account.
    *   Generate or reuse signing credentials.
    *   Create a production build of the app.
    *   Verify access to App Store Connect.
    *   Submit the app to TestFlight.
4.  **Testing:** Once the app is available in TestFlight, internal testers can be invited to download and test the app.

---

## 12. References

[1] [RevenueCat Shipyard 2026](https://revenuecat-shipyard-2026.devpost.com/)
[2] [React Native Documentation](https://reactnative.dev/)
[3] [Expo Documentation](https://docs.expo.dev/)
[4] [Convex Documentation](https://docs.convex.dev/)
[5] [Clerk Documentation](https://clerk.com/docs)
[6] [RevenueCat React Native SDK](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
[7] [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
[8] [Expo TestFlight Deployment](https://docs.expo.dev/build-reference/npx-testflight/)

---

**End of Document**
