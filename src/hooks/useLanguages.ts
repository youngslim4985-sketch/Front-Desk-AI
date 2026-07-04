import { useState, useEffect } from 'react';

export interface LanguageSetting {
  code: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
}

const DEFAULT_LANGUAGES: LanguageSetting[] = [
  { code: 'en', name: 'English (US)', enabled: true, isDefault: true },
  { code: 'es', name: 'Spanish (Español)', enabled: false, isDefault: false },
  { code: 'fr', name: 'French (Français)', enabled: false, isDefault: false },
  { code: 'pt', name: 'Portuguese (Português)', enabled: false, isDefault: false },
  { code: 'de', name: 'German (Deutsch)', enabled: false, isDefault: false },
];

export function useLanguages(businessId: string) {
  const [languages, setLanguages] = useState<LanguageSetting[]>(DEFAULT_LANGUAGES);
  const [draftLanguages, setDraftLanguages] = useState<LanguageSetting[]>(DEFAULT_LANGUAGES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load languages
  useEffect(() => {
    async function loadLanguages() {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Integrate with your production backend language API
        // const response = await fetch(`/api/languages?businessId=${businessId}`);
        // const data = await response.json();
        // if (data.success) { setLanguages(data.languages); setDraftLanguages(data.languages); }

        const cached = localStorage.getItem(`lexguard_languages_${businessId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setLanguages(parsed);
          setDraftLanguages(parsed);
        } else {
          localStorage.setItem(`lexguard_languages_${businessId}`, JSON.stringify(DEFAULT_LANGUAGES));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load languages');
      } finally {
        setIsLoading(false);
      }
    }

    if (businessId) {
      loadLanguages();
    }
  }, [businessId]);

  // Toggle enabling a language in draft mode
  const toggleLanguageDraft = (code: string) => {
    setDraftLanguages(prev =>
      prev.map(lang => {
        if (lang.code === code) {
          // Can't disable the default language
          if (lang.isDefault && lang.enabled) return lang;
          return { ...lang, enabled: !lang.enabled };
        }
        return lang;
      })
    );
  };

  // Set default language in draft mode (must also be enabled)
  const setDefaultLanguageDraft = (code: string) => {
    setDraftLanguages(prev =>
      prev.map(lang => {
        if (lang.code === code) {
          return { ...lang, isDefault: true, enabled: true };
        }
        return { ...lang, isDefault: false };
      })
    );
  };

  // Revert changes in draft mode to the last saved languages
  const resetDraft = () => {
    setDraftLanguages(languages);
  };

  // Check if draft has modifications
  const hasChanges = JSON.stringify(languages) !== JSON.stringify(draftLanguages);

  // Persist draft languages on explicit save
  const saveLanguages = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Validate that there is exactly one default language and it is enabled
      const defaultLangs = draftLanguages.filter(l => l.isDefault);
      if (defaultLangs.length !== 1 || !defaultLangs[0].enabled) {
        throw new Error('Please select exactly one enabled default language');
      }

      // TODO: Call your actual database API endpoint
      // const response = await fetch('/api/languages/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ businessId, languages: draftLanguages })
      // });
      // if (!response.ok) throw new Error('API save failed');

      // Simulating API network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLanguages(draftLanguages);
      localStorage.setItem(`lexguard_languages_${businessId}`, JSON.stringify(draftLanguages));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save language settings');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    languages,
    draftLanguages,
    isLoading,
    isSaving,
    error,
    hasChanges,
    toggleLanguageDraft,
    setDefaultLanguageDraft,
    resetDraft,
    saveLanguages
  };
}
