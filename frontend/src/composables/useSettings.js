import { ref, watch } from "vue";

export function useSettings(key, defaultValue) {
  const value = ref(defaultValue);

  // Load saved value from localStorage when the composable is initialized
  const loadSaved = () => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        // Try to parse as JSON first
        value.value = JSON.parse(saved);
      } catch (e) {
        // If not valid JSON, use as string
        value.value = saved;
      }
    }
  };

  // Save changes to localStorage
  watch(value, (newValue) => {
    if (typeof newValue === "object") {
      localStorage.setItem(key, JSON.stringify(newValue));
    } else {
      localStorage.setItem(key, newValue);
    }
  });

  // Initialize
  loadSaved();

  return value;
}
