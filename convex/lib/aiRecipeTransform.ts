/**
 * AI Recipe Transformation Utilities
 *
 * Converts AI-generated recipe data to the app's ingredient format.
 * Handles quantity parsing, unit normalization, and category assignment.
 */

/**
 * Ingredient category type matching the app schema
 */
export type IngredientCategory =
  | "meat"
  | "produce"
  | "dairy"
  | "pantry"
  | "spices"
  | "condiments"
  | "bread"
  | "other";

/**
 * AI ingredient format from Gemini response
 */
export interface AiIngredient {
  name: string;
  quantity: string;
  unit: string;
  is_optional: boolean;
  note?: string;
}

/**
 * App ingredient format for storage
 */
export interface AppIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Parse quantity string to number
 *
 * Handles:
 * - Whole numbers: "1", "2", "10"
 * - Decimals: "1.5", "0.25"
 * - Simple fractions: "1/2", "1/4", "3/4"
 * - Mixed numbers: "1 1/2", "2 1/4"
 * - Ranges (takes first): "1-2"
 *
 * @param quantityStr - String representation of quantity
 * @returns Numeric quantity (defaults to 1 if unparseable)
 */
export function parseQuantity(quantityStr: string): number {
  if (!quantityStr || typeof quantityStr !== "string") {
    return 1;
  }

  const trimmed = quantityStr.trim();
  if (!trimmed) {
    return 1;
  }

  // Try to parse as simple number first
  const simpleNum = parseFloat(trimmed);
  if (!isNaN(simpleNum) && /^[\d.]+$/.test(trimmed)) {
    return simpleNum;
  }

  // Check for mixed number (e.g., "1 1/2")
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    if (denominator !== 0) {
      return whole + numerator / denominator;
    }
  }

  // Check for simple fraction (e.g., "1/2")
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    if (denominator !== 0) {
      return numerator / denominator;
    }
  }

  // Try to extract first number from string
  const numMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    return parseFloat(numMatch[1]);
  }

  // Default to 1 if all parsing fails
  return 1;
}

/**
 * Categorize ingredient based on name
 *
 * Uses keyword matching to assign ingredients to categories.
 * Categories: meat, produce, dairy, pantry, spices, condiments, bread, other
 *
 * @param ingredientName - Name of the ingredient
 * @returns Appropriate category
 */
export function categorizeIngredient(ingredientName: string): IngredientCategory {
  const name = ingredientName.toLowerCase();

  // Meat and proteins
  const meatKeywords = [
    "chicken",
    "beef",
    "pork",
    "lamb",
    "turkey",
    "duck",
    "fish",
    "salmon",
    "tuna",
    "shrimp",
    "prawn",
    "crab",
    "lobster",
    "scallop",
    "clam",
    "mussel",
    "oyster",
    "bacon",
    "ham",
    "sausage",
    "steak",
    "ground meat",
    "mince",
    "tenderloin",
    "chop",
    "wing",
    "thigh",
    "breast",
    "fillet",
    "seafood",
    "anchovy",
  ];
  if (meatKeywords.some((kw) => name.includes(kw))) {
    return "meat";
  }

  // Dairy and eggs
  const dairyKeywords = [
    "milk",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "egg",
    "sour cream",
    "cottage cheese",
    "ricotta",
    "mozzarella",
    "parmesan",
    "cheddar",
    "feta",
    "brie",
    "gouda",
    "whey",
    "ghee",
    "half and half",
    "creme fraiche",
  ];
  if (dairyKeywords.some((kw) => name.includes(kw))) {
    return "dairy";
  }

  // Spices and seasonings (check before produce for herbs)
  const spiceKeywords = [
    "salt",
    "pepper",
    "paprika",
    "cumin",
    "coriander",
    "turmeric",
    "cinnamon",
    "nutmeg",
    "ginger powder",
    "garlic powder",
    "onion powder",
    "chili powder",
    "cayenne",
    "oregano",
    "thyme",
    "rosemary",
    "basil dried",
    "bay leaf",
    "clove",
    "cardamom",
    "allspice",
    "fennel seed",
    "mustard seed",
    "sesame seed",
    "caraway",
    "saffron",
    "vanilla extract",
    "extract",
    "seasoning",
    "spice",
    "dried herb",
  ];
  if (spiceKeywords.some((kw) => name.includes(kw))) {
    return "spices";
  }

  // Condiments and sauces
  const condimentKeywords = [
    "sauce",
    "soy sauce",
    "fish sauce",
    "worcestershire",
    "tabasco",
    "hot sauce",
    "ketchup",
    "mustard",
    "mayonnaise",
    "mayo",
    "vinegar",
    "dressing",
    "relish",
    "salsa",
    "pesto",
    "hummus",
    "tahini",
    "sriracha",
    "teriyaki",
    "bbq",
    "hoisin",
    "oyster sauce",
  ];
  if (condimentKeywords.some((kw) => name.includes(kw))) {
    return "condiments";
  }

  // Bread and bakery
  const breadKeywords = [
    "bread",
    "tortilla",
    "pita",
    "naan",
    "baguette",
    "roll",
    "bun",
    "crouton",
    "breadcrumb",
    "panko",
    "wrap",
    "flatbread",
    "ciabatta",
    "focaccia",
    "croissant",
    "muffin",
    "bagel",
  ];
  if (breadKeywords.some((kw) => name.includes(kw))) {
    return "bread";
  }

  // Produce (fruits, vegetables, fresh herbs)
  const produceKeywords = [
    "tomato",
    "onion",
    "garlic",
    "carrot",
    "celery",
    "potato",
    "lettuce",
    "spinach",
    "kale",
    "cabbage",
    "broccoli",
    "cauliflower",
    "pepper",
    "bell pepper",
    "jalapeno",
    "zucchini",
    "squash",
    "eggplant",
    "mushroom",
    "corn",
    "pea",
    "bean",
    "green bean",
    "asparagus",
    "artichoke",
    "cucumber",
    "avocado",
    "lemon",
    "lime",
    "orange",
    "apple",
    "banana",
    "berry",
    "strawberry",
    "blueberry",
    "raspberry",
    "grape",
    "melon",
    "mango",
    "pineapple",
    "peach",
    "pear",
    "plum",
    "cherry",
    "fresh basil",
    "fresh parsley",
    "fresh cilantro",
    "fresh mint",
    "fresh herb",
    "scallion",
    "green onion",
    "shallot",
    "leek",
    "ginger",
    "radish",
    "beet",
    "turnip",
    "sweet potato",
    "yam",
  ];
  if (produceKeywords.some((kw) => name.includes(kw))) {
    return "produce";
  }

  // Pantry items (last to catch remaining staples)
  const pantryKeywords = [
    "flour",
    "sugar",
    "oil",
    "olive oil",
    "vegetable oil",
    "canola",
    "sesame oil",
    "coconut oil",
    "rice",
    "pasta",
    "noodle",
    "spaghetti",
    "penne",
    "macaroni",
    "quinoa",
    "couscous",
    "oat",
    "cereal",
    "corn starch",
    "baking powder",
    "baking soda",
    "yeast",
    "honey",
    "maple syrup",
    "molasses",
    "cocoa",
    "chocolate",
    "can",
    "canned",
    "stock",
    "broth",
    "tomato paste",
    "tomato sauce",
    "coconut milk",
    "nut",
    "almond",
    "walnut",
    "cashew",
    "peanut",
    "lentil",
    "chickpea",
    "black bean",
    "kidney bean",
    "tofu",
    "tempeh",
    "seitan",
  ];
  if (pantryKeywords.some((kw) => name.includes(kw))) {
    return "pantry";
  }

  // Default to other
  return "other";
}

/**
 * Transform AI ingredients to app format
 *
 * Converts the AI response ingredient format to the app's storage format.
 * Handles optional ingredients by appending "(optional)" to name.
 *
 * @param aiIngredients - Array of AI-format ingredients
 * @returns Array of app-format ingredients
 */
export function transformAiIngredients(
  aiIngredients: AiIngredient[]
): AppIngredient[] {
  return aiIngredients.map((ing) => {
    // Build the ingredient name with optional marker and note
    let name = ing.name;
    if (ing.is_optional) {
      if (ing.note) {
        name = `${ing.name} (optional - ${ing.note})`;
      } else {
        name = `${ing.name} (optional)`;
      }
    }

    return {
      name,
      quantity: parseQuantity(ing.quantity),
      unit: ing.unit || "item",
      category: categorizeIngredient(ing.name),
    };
  });
}

/**
 * Transform AI recipe steps to instruction strings
 *
 * Extracts just the instruction text from AI step objects.
 *
 * @param steps - Array of AI step objects
 * @returns Array of instruction strings
 */
export function transformAiSteps(
  steps: Array<{ step_number: number; instruction: string; notes?: string }>
): string[] {
  return steps
    .sort((a, b) => a.step_number - b.step_number)
    .map((step) => {
      if (step.notes) {
        return `${step.instruction} (Note: ${step.notes})`;
      }
      return step.instruction;
    });
}

/**
 * Generate placeholder image URL for AI-generated recipe
 *
 * Creates a visually appealing placeholder with Sous Chef branding.
 * Uses the app's orange color scheme with sparkle emoji.
 *
 * @param recipeName - Name of the recipe
 * @returns Placeholder image URL
 */
export function getPlaceholderImageUrl(recipeName: string): string {
  // Use a variety of food-themed placeholder images based on recipe name hash
  // This creates visual variety while keeping images relevant to cooking
  const foodPlaceholders = [
    // Unsplash food images (free, reliable CDN)
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop", // Cooking ingredients
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop", // Fresh vegetables
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop", // Healthy meal prep
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop", // Plated dish
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop", // Pasta
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop", // Salad bowl
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop", // Salmon dish
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop", // Soup
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop", // Pizza
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=600&fit=crop", // Breakfast
  ];

  // Simple hash function to deterministically pick an image based on recipe name
  let hash = 0;
  for (let i = 0; i < recipeName.length; i++) {
    hash = ((hash << 5) - hash) + recipeName.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % foodPlaceholders.length;
  return foodPlaceholders[index];
}
