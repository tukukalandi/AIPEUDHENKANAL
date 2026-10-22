import { BlogPost } from '../types';

const OFFLINE_POSTS_KEY = 'aipeu_offline_posts_v1';
const BOOKMARKED_IDS_KEY = 'aipeu_saved_ids_v1';
const SIMULATED_OFFLINE_KEY = 'aipeu_simulated_offline';

export function getSimulatedOffline(): boolean {
  try {
    return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSimulatedOffline(val: boolean): void {
  try {
    localStorage.setItem(SIMULATED_OFFLINE_KEY, val ? 'true' : 'false');
    window.dispatchEvent(new Event('online-status-changed'));
  } catch {}
}

export function getOfflinePosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(OFFLINE_POSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline posts', e);
    return [];
  }
}

export function savePostForOffline(post: BlogPost): boolean {
  try {
    const posts = getOfflinePosts();
    const existingIndex = posts.findIndex((p) => p.id === post.id);
    const enriched = { ...post, isSavedOffline: true };

    if (existingIndex >= 0) {
      posts[existingIndex] = enriched;
    } else {
      posts.unshift(enriched);
    }

    localStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(posts));

    // Also update saved IDs
    const savedIds = getSavedPostIds();
    if (!savedIds.includes(post.id)) {
      savedIds.push(post.id);
      localStorage.setItem(BOOKMARKED_IDS_KEY, JSON.stringify(savedIds));
    }

    window.dispatchEvent(new Event('offline-storage-updated'));
    return true;
  } catch (e) {
    console.error('Error saving post offline', e);
    return false;
  }
}

export function removePostFromOffline(postId: string): void {
  try {
    const posts = getOfflinePosts().filter((p) => p.id !== postId);
    localStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(posts));

    const savedIds = getSavedPostIds().filter((id) => id !== postId);
    localStorage.setItem(BOOKMARKED_IDS_KEY, JSON.stringify(savedIds));

    window.dispatchEvent(new Event('offline-storage-updated'));
  } catch (e) {
    console.error('Error removing post', e);
  }
}

export function isPostSavedOffline(postId: string): boolean {
  const savedIds = getSavedPostIds();
  return savedIds.includes(postId);
}

export function getSavedPostIds(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAllForOffline(postsList: BlogPost[]): number {
  try {
    const existing = getOfflinePosts();
    const map = new Map<string, BlogPost>();
    existing.forEach((p) => map.set(p.id, p));
    postsList.forEach((p) => map.set(p.id, { ...p, isSavedOffline: true }));

    const merged = Array.from(map.values());
    localStorage.setItem(OFFLINE_POSTS_KEY, JSON.stringify(merged));
    localStorage.setItem(
      BOOKMARKED_IDS_KEY,
      JSON.stringify(merged.map((p) => p.id))
    );

    window.dispatchEvent(new Event('offline-storage-updated'));
    return merged.length;
  } catch (e) {
    console.error('Error bulk saving offline posts', e);
    return 0;
  }
}

export function clearAllOfflinePosts(): void {
  try {
    localStorage.removeItem(OFFLINE_POSTS_KEY);
    localStorage.removeItem(BOOKMARKED_IDS_KEY);
    window.dispatchEvent(new Event('offline-storage-updated'));
  } catch {}
}

export function getStorageUsage(): { count: number; estimatedSizeKb: number } {
  try {
    const raw = localStorage.getItem(OFFLINE_POSTS_KEY) || '';
    const sizeKb = Math.round((raw.length * 2) / 1024);
    const count = getSavedPostIds().length;
    return { count, estimatedSizeKb: sizeKb };
  } catch {
    return { count: 0, estimatedSizeKb: 0 };
  }
}
