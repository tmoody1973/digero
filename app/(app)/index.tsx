/**
 * App Entry Point
 *
 * Redirects to Discover as the default landing page.
 */

import { Redirect } from "expo-router";

export default function AppIndex() {
  return <Redirect href="/(app)/discover" />;
}
