/**
 * Unit Conversion Utility
 *
 * Converts between compatible units for ingredient aggregation.
 * Supports weight (oz, lbs) and volume (tsp, tbsp, cup) conversions.
 */

/**
 * Unit groups for determining compatibility
 */
const UNIT_GROUPS: Record<string, string[]> = {
  weight: ["oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds"],
  volume: ["tsp", "teaspoon", "teaspoons", "tbsp", "tablespoon", "tablespoons", "cup", "cups"],
};

/**
 * Conversion factors to base unit within each group
 * Weight: base unit is oz
 * Volume: base unit is tsp
 */
const TO_BASE_UNIT: Record<string, number> = {
  // Weight (base: oz)
  oz: 1,
  ounce: 1,
  ounces: 1,
  lb: 16,
  lbs: 16,
  pound: 16,
  pounds: 16,

  // Volume (base: tsp)
  tsp: 1,
  teaspoon: 1,
  teaspoons: 1,
  tbsp: 3,
  tablespoon: 3,
  tablespoons: 3,
  cup: 48, // 16 tbsp * 3 tsp = 48 tsp
  cups: 48,
};

/**
 * Preferred units for each group (used when combining)
 * Order: smallest to largest
 */
const PREFERRED_UNITS: Record<string, { unit: string; threshold: number }[]> = {
  weight: [
    { unit: "oz", threshold: 0 },
    { unit: "lbs", threshold: 16 }, // 16 oz = 1 lb
  ],
  volume: [
    { unit: "tsp", threshold: 0 },
    { unit: "tbsp", threshold: 3 },  // 3 tsp = 1 tbsp
    { unit: "cups", threshold: 48 }, // 48 tsp = 1 cup
  ],
};

/**
 * Normalize unit name to lowercase without 's' suffix variations
 *
 * @param unit - The unit to normalize
 * @returns Normalized unit string
 */
export function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim();
}

/**
 * Get the unit group for a given unit
 *
 * @param unit - The unit to check
 * @returns The group name or null if not found
 */
export function getUnitGroup(unit: string): string | null {
  const normalized = normalizeUnit(unit);

  for (const [group, units] of Object.entries(UNIT_GROUPS)) {
    if (units.includes(normalized)) {
      return group;
    }
  }

  return null;
}

/**
 * Check if two units are compatible (can be converted)
 *
 * @param unit1 - First unit
 * @param unit2 - Second unit
 * @returns True if units can be converted between
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const group1 = getUnitGroup(unit1);
  const group2 = getUnitGroup(unit2);

  if (!group1 || !group2) {
    return false;
  }

  return group1 === group2;
}

/**
 * Convert a quantity from one unit to another
 *
 * @param quantity - The quantity to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @returns The converted quantity, or null if conversion is not possible
 */
export function convertUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);

  // Same unit, no conversion needed
  if (normalizedFrom === normalizedTo) {
    return quantity;
  }

  // Check compatibility
  if (!areUnitsCompatible(fromUnit, toUnit)) {
    return null;
  }

  const fromFactor = TO_BASE_UNIT[normalizedFrom];
  const toFactor = TO_BASE_UNIT[normalizedTo];

  if (fromFactor === undefined || toFactor === undefined) {
    return null;
  }

  // Convert: quantity -> base unit -> target unit
  const baseQuantity = quantity * fromFactor;
  return baseQuantity / toFactor;
}

/**
 * Choose the best unit for a given quantity in base units
 *
 * @param baseQuantity - The quantity in base units (oz for weight, tsp for volume)
 * @param group - The unit group
 * @returns Object with unit and converted quantity
 */
export function chooseBestUnit(
  baseQuantity: number,
  group: string
): { unit: string; quantity: number } {
  const preferences = PREFERRED_UNITS[group];

  if (!preferences) {
    return { unit: group === "weight" ? "oz" : "tsp", quantity: baseQuantity };
  }

  // Find the largest unit where the quantity is at least 1
  let bestUnit = preferences[0];

  for (const pref of preferences) {
    if (baseQuantity >= pref.threshold) {
      bestUnit = pref;
    }
  }

  const factor = TO_BASE_UNIT[bestUnit.unit] || 1;
  return {
    unit: bestUnit.unit,
    quantity: Math.round((baseQuantity / factor) * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Combine two quantities with potentially different units
 *
 * @param qty1 - First quantity
 * @param unit1 - First unit
 * @param qty2 - Second quantity
 * @param unit2 - Second unit
 * @returns Combined quantity and unit, or null if not compatible
 */
export function combineQuantities(
  qty1: number,
  unit1: string,
  qty2: number,
  unit2: string
): { quantity: number; unit: string } | null {
  const group = getUnitGroup(unit1);

  if (!group || !areUnitsCompatible(unit1, unit2)) {
    return null;
  }

  // Convert both to base units
  const factor1 = TO_BASE_UNIT[normalizeUnit(unit1)];
  const factor2 = TO_BASE_UNIT[normalizeUnit(unit2)];

  if (factor1 === undefined || factor2 === undefined) {
    return null;
  }

  const totalBase = qty1 * factor1 + qty2 * factor2;

  // Choose the best unit for the combined quantity
  return chooseBestUnit(totalBase, group);
}

/**
 * Check if a unit is a count unit (not convertible)
 *
 * @param unit - The unit to check
 * @returns True if it's a count unit
 */
export function isCountUnit(unit: string): boolean {
  const normalized = normalizeUnit(unit);
  const countUnits = [
    "piece",
    "pieces",
    "clove",
    "cloves",
    "head",
    "heads",
    "bunch",
    "bunches",
    "sprig",
    "sprigs",
    "slice",
    "slices",
    "whole",
    "large",
    "medium",
    "small",
    "can",
    "cans",
    "bottle",
    "bottles",
    "package",
    "packages",
    "pkg",
    "box",
    "boxes",
    "bag",
    "bags",
    "container",
    "containers",
    "jar",
    "jars",
    "stick",
    "sticks",
    "strip",
    "strips",
    "fillet",
    "fillets",
    "breast",
    "breasts",
    "thigh",
    "thighs",
    "leaf",
    "leaves",
    "item",
    "items",
    "each",
    "pinch",
    "dash",
    "",
  ];

  return countUnits.includes(normalized) || !getUnitGroup(unit);
}
