import { supabase } from './supabase';

export function subscribeToPerfumeChanges(channelName, onChange) {
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'perfumes' },
      onChange
    )
    .subscribe();
}
