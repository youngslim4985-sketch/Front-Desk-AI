import { useState, useEffect } from 'react';

export interface BusinessSettings {
  businessName: string;
  phone: string;
  industry: string;
  aiPersonality: 'friendly' | 'professional' | 'assertive';
  greetingMessage: string;
  responseTone: string;
  forwardingNumber: string;
  promptContext: string;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'LexGuard Client',
  phone: '+1 (555) 123-4567',
  industry: 'Legal (Personal Injury)',
  aiPersonality: 'professional',
  greetingMessage: 'Thank you for calling LexGuard. Are you calling regarding a new legal matter?',
  responseTone: 'Empathetic, clear, and professional. Avoid legal advice, prioritize securing intake detail and booking consultations.',
  forwardingNumber: '+1 (555) 999-0000',
  promptContext: 'Act as LexGuard AI, an autonomous legal receptionist. Your goal is to secure lead information (Name, Phone, Practice Area, Urgency), verify there are no active conflicts of interest, and book a consultation using the availability tool. Escalate urgent emergencies only.'
};

export function useBusinessSettings(businessId: string) {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Integrate with your production backend REST API
        // const response = await fetch(`/api/settings?businessId=${businessId}`);
        // const data = await response.json();
        // if (data.success) { setSettings(data.settings); }
        
        // Fallback/Mock persistence using localStorage
        const cached = localStorage.getItem(`lexguard_settings_${businessId}`);
        if (cached) {
          setSettings(JSON.parse(cached));
        } else {
          // If no cached settings, initialize with defaults
          localStorage.setItem(`lexguard_settings_${businessId}`, JSON.stringify(DEFAULT_SETTINGS));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }

    if (businessId) {
      loadSettings();
    }
  }, [businessId]);

  // Save settings
  const saveSettings = async (newSettings: BusinessSettings) => {
    setIsSaving(true);
    setError(null);
    try {
      // TODO: Call your actual API endpoint to sync settings database-side
      // const response = await fetch('/api/settings/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ businessId, settings: newSettings })
      // });
      // if (!response.ok) throw new Error('API save failed');

      // Simulating API network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSettings(newSettings);
      localStorage.setItem(`lexguard_settings_${businessId}`, JSON.stringify(newSettings));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    error,
    saveSettings
  };
}
