import { useFavicon } from '../hooks/useFavicon';

/** Syncs document favicon with the store logo (or default FoodExpress mark). */
export default function FaviconUpdater() {
  useFavicon();
  return null;
}
