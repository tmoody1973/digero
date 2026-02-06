/**
 * Creator Utilities
 *
 * Utility functions for creator application flow including
 * YouTube URL parsing, tier determination, and form validation.
 */

// =============================================================================
// Types
// =============================================================================

export interface ApplicationFormData {
  youtubeChannelUrl: string;
  bio: string;
  specialties: string[];
  payoutEmail: string;
}

export interface FormErrors {
  youtubeChannelUrl?: string;
  bio?: string;
  specialties?: string;
  payoutEmail?: string;
}

export interface TierInfo {
  tier: "emerging" | "established" | "partner" | null;
  multiplier: number;
  eligible: boolean;
  minimumRequired?: number;
  description: string;
  badge: {
    label: string;
    color: string;
    bgColor: string;
  } | null;
}

// =============================================================================
// YouTube URL Parsing
// =============================================================================

/**
 * YouTube URL patterns for channel detection
 */
const YOUTUBE_URL_PATTERNS = [
  // @handle format: youtube.com/@handle
  {
    pattern: /^https?:\/\/(www\.)?youtube\.com\/@([\w.-]+)/,
    type: "handle" as const,
    extractIndex: 2,
  },
  // Channel ID format: youtube.com/channel/UCXXXX
  {
    pattern: /^https?:\/\/(www\.)?youtube\.com\/channel\/(UC[\w-]+)/,
    type: "channelId" as const,
    extractIndex: 2,
  },
  // Custom URL format: youtube.com/c/CustomName
  {
    pattern: /^https?:\/\/(www\.)?youtube\.com\/c\/([\w.-]+)/,
    type: "customUrl" as const,
    extractIndex: 2,
  },
  // User format: youtube.com/user/Username
  {
    pattern: /^https?:\/\/(www\.)?youtube\.com\/user\/([\w.-]+)/,
    type: "user" as const,
    extractIndex: 2,
  },
];

/**
 * Check if URL is a valid YouTube channel URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;
  return YOUTUBE_URL_PATTERNS.some(({ pattern }) => pattern.test(url));
}

/**
 * Extract channel identifier from YouTube URL
 * Returns null if URL is not a valid YouTube channel URL
 */
export function extractChannelFromUrl(url: string): {
  type: "handle" | "channelId" | "customUrl" | "user";
  identifier: string;
} | null {
  if (!url || url.trim() === "") return null;

  for (const { pattern, type, extractIndex } of YOUTUBE_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[extractIndex]) {
      return {
        type,
        identifier: match[extractIndex],
      };
    }
  }

  return null;
}

/**
 * Normalize YouTube URL to a standard format
 */
export function normalizeYouTubeUrl(url: string): string {
  const channelInfo = extractChannelFromUrl(url);
  if (!channelInfo) return url;

  switch (channelInfo.type) {
    case "channelId":
      return `https://youtube.com/channel/${channelInfo.identifier}`;
    case "handle":
      return `https://youtube.com/@${channelInfo.identifier}`;
    case "customUrl":
      return `https://youtube.com/c/${channelInfo.identifier}`;
    case "user":
      return `https://youtube.com/user/${channelInfo.identifier}`;
    default:
      return url;
  }
}

// =============================================================================
// Tier Determination
// =============================================================================

/**
 * Determine creator tier based on subscriber count
 *
 * Tiers:
 * - Partner: 500K+ subscribers (1.5x RES multiplier)
 * - Established: 100K-499K subscribers (1.2x RES multiplier)
 * - Emerging: 10K-99K subscribers (1.0x RES multiplier)
 * - Ineligible: <10K subscribers
 */
export function determineCreatorTier(subscriberCount: number): TierInfo {
  if (subscriberCount >= 500000) {
    return {
      tier: "partner",
      multiplier: 1.5,
      eligible: true,
      description: "Partner creators earn 1.5x the standard RES multiplier on all engagement. This tier is reserved for channels with 500K+ subscribers.",
      badge: {
        label: "Partner",
        color: "text-amber-700 dark:text-amber-300",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
      },
    };
  }

  if (subscriberCount >= 100000) {
    return {
      tier: "established",
      multiplier: 1.2,
      eligible: true,
      description: "Established creators earn 1.2x the standard RES multiplier. Channels with 100K-499K subscribers qualify for this tier.",
      badge: {
        label: "Established",
        color: "text-violet-700 dark:text-violet-300",
        bgColor: "bg-violet-100 dark:bg-violet-900/30",
      },
    };
  }

  if (subscriberCount >= 10000) {
    return {
      tier: "emerging",
      multiplier: 1.0,
      eligible: true,
      description: "Emerging creators earn the standard RES multiplier. Channels with 10K-99K subscribers start at this tier.",
      badge: {
        label: "Emerging",
        color: "text-teal-700 dark:text-teal-300",
        bgColor: "bg-teal-100 dark:bg-teal-900/30",
      },
    };
  }

  return {
    tier: null,
    multiplier: 0,
    eligible: false,
    minimumRequired: 10000,
    description: "A minimum of 10,000 YouTube subscribers is required to apply for the creator partnership program.",
    badge: null,
  };
}

/**
 * Format subscriber count for display
 */
export function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Get tier requirements summary
 */
export function getTierRequirements(): {
  tier: string;
  minSubscribers: number;
  maxSubscribers: number | null;
  multiplier: number;
}[] {
  return [
    { tier: "Emerging", minSubscribers: 10000, maxSubscribers: 99999, multiplier: 1.0 },
    { tier: "Established", minSubscribers: 100000, maxSubscribers: 499999, multiplier: 1.2 },
    { tier: "Partner", minSubscribers: 500000, maxSubscribers: null, multiplier: 1.5 },
  ];
}

// =============================================================================
// Form Validation
// =============================================================================

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate creator application form
 */
export function validateApplicationForm(formData: ApplicationFormData): FormErrors {
  const errors: FormErrors = {};

  // YouTube URL validation
  if (!formData.youtubeChannelUrl || formData.youtubeChannelUrl.trim() === "") {
    errors.youtubeChannelUrl = "YouTube channel URL is required";
  } else if (!isValidYouTubeUrl(formData.youtubeChannelUrl)) {
    errors.youtubeChannelUrl = "Please enter a valid YouTube channel URL";
  }

  // Email validation
  if (!formData.payoutEmail || formData.payoutEmail.trim() === "") {
    errors.payoutEmail = "Payout email is required";
  } else if (!isValidEmail(formData.payoutEmail)) {
    errors.payoutEmail = "Please enter a valid email address";
  }

  // Specialties validation (at least 1 required)
  if (!formData.specialties || formData.specialties.length === 0) {
    errors.specialties = "Please select at least one specialty";
  }

  return errors;
}

/**
 * Check if form is valid (no errors)
 */
export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}
