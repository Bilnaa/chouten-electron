// src/composables/useToast.ts
import { inject } from 'vue';

export function useToast() {
  const showToast = inject('showToast') as (title: string, message: string, icon?: string, duration?: number) => void;

  if (!showToast) {
    throw new Error('Toast is not available');
  }

  return showToast;
}