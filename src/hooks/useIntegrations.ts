import { useState, useEffect } from 'react';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'calendar' | 'crm' | 'communication';
  connected: boolean;
  connecting?: boolean;
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: 'google_calendar', name: 'Google Calendar', description: 'Schedule consultations directly on attorneys\' calendars.', category: 'calendar', connected: false },
  { id: 'clio', name: 'Clio Manage', description: 'Sync leads, clients, and intake records straight into Clio.', category: 'crm', connected: false },
  { id: 'mycase', name: 'MyCase', description: 'Automatically log call transcripts and cases in MyCase CRM.', category: 'crm', connected: false },
  { id: 'slack', name: 'Slack', description: 'Dispatch real-time emergency text notifications to your firm channels.', category: 'communication', connected: false }
];

export function useIntegrations(businessId: string) {
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load integrations
  useEffect(() => {
    async function loadIntegrations() {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Fetch existing integrations status from backend API
        // const response = await fetch(`/api/integrations?businessId=${businessId}`);
        // const data = await response.json();
        // if (data.success) { setIntegrations(data.integrations); }

        const cached = localStorage.getItem(`lexguard_integrations_${businessId}`);
        if (cached) {
          setIntegrations(JSON.parse(cached));
        } else {
          localStorage.setItem(`lexguard_integrations_${businessId}`, JSON.stringify(DEFAULT_INTEGRATIONS));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load integrations');
      } finally {
        setIsLoading(false);
      }
    }

    if (businessId) {
      loadIntegrations();
    }
  }, [businessId]);

  // Connect integration (Simulate OAuth flow)
  const connectIntegration = async (id: string) => {
    setError(null);
    
    // Set connecting loading state for specific integration
    setIntegrations(prev => 
      prev.map(item => item.id === id ? { ...item, connecting: true } : item)
    );

    try {
      // Simulate OAuth redirect or authorization flow delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update state to connected
      setIntegrations(prev => {
        const updated = prev.map(item => 
          item.id === id ? { ...item, connected: true, connecting: false } : item
        );
        // Persist
        localStorage.setItem(`lexguard_integrations_${businessId}`, JSON.stringify(updated));
        return updated;
      });

      // TODO: Save connection callback details database-side
      // await fetch('/api/integrations/connect', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ businessId, integrationId: id, connected: true })
      // });

      return true;
    } catch (err: any) {
      // Reset connecting state on error
      setIntegrations(prev => 
        prev.map(item => item.id === id ? { ...item, connecting: false } : item)
      );
      setError(err.message || `Failed to connect to ${id}`);
      return false;
    }
  };

  // Disconnect integration
  const disconnectIntegration = async (id: string) => {
    setError(null);
    try {
      // Simulating API disconnect delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setIntegrations(prev => {
        const updated = prev.map(item => 
          item.id === id ? { ...item, connected: false } : item
        );
        // Persist
        localStorage.setItem(`lexguard_integrations_${businessId}`, JSON.stringify(updated));
        return updated;
      });

      // TODO: Save disconnection details to database
      // await fetch('/api/integrations/disconnect', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ businessId, integrationId: id, connected: false })
      // });

      return true;
    } catch (err: any) {
      setError(err.message || `Failed to disconnect ${id}`);
      return false;
    }
  };

  return {
    integrations,
    isLoading,
    error,
    connectIntegration,
    disconnectIntegration
  };
}
