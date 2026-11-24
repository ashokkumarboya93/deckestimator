// =============================================
// Deck Estimator — Application Contact Channels Store & Hook
// =============================================
// Syncs admin-tuned contact numbers, WhatsApp, email, address, and hours
// across Customer Portal, Contractor Portal, Footers, and Support Hubs.

import { useState, useEffect } from 'react';

export const DEFAULT_CONTACT_CHANNELS = {
  supportPhone: '(856) 666-8888',
  whatsappNumber: '+1 (856) 555-0199',
  supportEmail: 'support@deckestimator.com',
  businessAddress: '1452 Boardwalk Ave, Cherry Hill, NJ 08002',
  operatingHours: 'Mon - Fri: 8:00 AM - 6:00 PM EST, Sat: 9:00 AM - 2:00 PM EST',
  companyName: 'Deck Restoration Plus',
  brandTagline: 'Commercial & Residential Exterior Wood Restoration Specialists',
};

const STORAGE_KEY = 'deck_contact_channels';
const UPDATE_EVENT = 'deck_contact_channels_updated';

export function getCachedContactChannels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONTACT_CHANNELS, ...parsed };
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_CONTACT_CHANNELS;
}

export function saveContactChannelsLocally(channels) {
  try {
    const merged = { ...DEFAULT_CONTACT_CHANNELS, ...channels };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: merged }));
  } catch {
    // Ignore storage quota
  }
}

export function useContactChannels() {
  const [channels, setChannels] = useState(getCachedContactChannels);

  useEffect(() => {
    // 1. Fetch latest public settings from server
    let mounted = true;
    fetch('/api/v1/settings/public', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted || !data?.success) return;
        const serverChannels = data.channels || {};
        const merged = { ...getCachedContactChannels(), ...serverChannels };
        saveContactChannelsLocally(merged);
        setChannels(merged);
      })
      .catch(() => {
        // Keep cached/default channels on network failure
      });

    // 2. Listen to real-time custom events from admin saves
    const handleUpdate = (e) => {
      if (e.detail) {
        setChannels({ ...DEFAULT_CONTACT_CHANNELS, ...e.detail });
      }
    };

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setChannels(JSON.parse(e.newValue));
        } catch {}
      }
    });

    return () => {
      mounted = false;
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
    };
  }, []);

  return channels;
}
