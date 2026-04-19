import { ensureSupabaseConfigured, supabase } from './supabase';
import {
  buildSafeFileName,
  compactImages,
  extractStoragePath,
  validateImageFile,
} from './security';

export async function uploadImage(file, folder = 'covers') {
  ensureSupabaseConfigured();
  validateImageFile(file);

  const fileName = buildSafeFileName(file);
  const path = `${folder}/${fileName}`;

  const { error } = await supabase.storage.from('perfumes').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('perfumes').getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

export async function uploadManyImages(files, folder = 'gallery') {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

export async function deleteStoragePaths(paths) {
  ensureSupabaseConfigured();

  const safePaths = compactImages(paths);

  if (!safePaths.length) {
    return;
  }

  const { error } = await supabase.storage.from('perfumes').remove(safePaths);

  if (error) {
    throw error;
  }
}

export function extractStoragePathsFromUrls(urls) {
  return compactImages(urls).map(extractStoragePath).filter(Boolean);
}
