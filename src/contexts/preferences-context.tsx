"use client"

import * as React from "react"
import {
  DEFAULT_PREFERENCES,
  BUILTIN_PROFILES,
  getClientLabels,
  type UserPreferences,
  type PreferenceProfile,
  type EntityNamingPreferences,
  type DisplayPreferences,
} from "@/types/preferences"

const STORAGE_PREFS_KEY = "vault_user_preferences"
const STORAGE_PROFILES_KEY = "vault_user_preference_profiles"
const STORAGE_ACTIVE_PROFILE_KEY = "vault_active_preference_profile"

interface PreferencesContextType {
  preferences: UserPreferences
  activeProfileId: string
  profiles: PreferenceProfile[]
  clientLabelSingular: string
  clientLabelPlural: string
  isHydrated: boolean
  selectProfile: (profileId: string) => void
  saveAsNewProfile: (name: string, description?: string) => PreferenceProfile
  deleteProfile: (profileId: string) => void
  updateEntityNaming: (naming: Partial<EntityNamingPreferences>) => void
  updateDisplay: (display: Partial<DisplayPreferences>) => void
  resetToDefaults: () => void
}

const PreferencesContext = React.createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = React.useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [profiles, setProfiles] = React.useState<PreferenceProfile[]>(BUILTIN_PROFILES)
  const [activeProfileId, setActiveProfileId] = React.useState<string>("standard-accounting")
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false)

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_PROFILES_KEY)
      let customProfiles: PreferenceProfile[] = []
      if (storedProfiles) {
        customProfiles = JSON.parse(storedProfiles)
      }

      const combinedProfiles = [
        ...BUILTIN_PROFILES,
        ...customProfiles.filter((cp) => !BUILTIN_PROFILES.some((bp) => bp.id === cp.id)),
      ]
      setProfiles(combinedProfiles)

      const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_PROFILE_KEY)
      if (storedActiveId && combinedProfiles.some((p) => p.id === storedActiveId)) {
        setActiveProfileId(storedActiveId)
      }

      const storedPrefs = localStorage.getItem(STORAGE_PREFS_KEY)
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs)
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
          entityNaming: {
            ...DEFAULT_PREFERENCES.entityNaming,
            ...(parsed.entityNaming || {}),
          },
          display: {
            ...DEFAULT_PREFERENCES.display,
            ...(parsed.display || {}),
          },
        })
      }
    } catch {
      // Ignore storage errors fallback to defaults
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Persist preferences
  const savePreferences = React.useCallback((next: UserPreferences) => {
    setPreferences(next)
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(next))
    } catch {
      // Ignore
    }
  }, [])

  // Select profile
  const selectProfile = React.useCallback(
    (profileId: string) => {
      const target = profiles.find((p) => p.id === profileId)
      if (!target) return
      setActiveProfileId(profileId)
      savePreferences(target.preferences)
      try {
        localStorage.setItem(STORAGE_ACTIVE_PROFILE_KEY, profileId)
      } catch {
        // Ignore
      }
    },
    [profiles, savePreferences]
  )

  // Save current preferences as new custom profile
  const saveAsNewProfile = React.useCallback(
    (name: string, description = "Custom user preference profile"): PreferenceProfile => {
      const newProfile: PreferenceProfile = {
        id: `profile-${Date.now()}`,
        name: name.trim() || "Custom Profile",
        description,
        isBuiltIn: false,
        preferences: { ...preferences },
      }

      setProfiles((prev) => {
        const updated = [...prev, newProfile]
        try {
          const customOnly = updated.filter((p) => !p.isBuiltIn)
          localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(customOnly))
        } catch {
          // Ignore
        }
        return updated
      })

      setActiveProfileId(newProfile.id)
      try {
        localStorage.setItem(STORAGE_ACTIVE_PROFILE_KEY, newProfile.id)
      } catch {
        // Ignore
      }

      return newProfile
    },
    [preferences]
  )

  // Delete custom profile
  const deleteProfile = React.useCallback(
    (profileId: string) => {
      setProfiles((prev) => {
        const target = prev.find((p) => p.id === profileId)
        if (!target || target.isBuiltIn) return prev
        const filtered = prev.filter((p) => p.id !== profileId)
        try {
          const customOnly = filtered.filter((p) => !p.isBuiltIn)
          localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(customOnly))
        } catch {
          // Ignore
        }
        return filtered
      })

      if (activeProfileId === profileId) {
        selectProfile("standard-accounting")
      }
    },
    [activeProfileId, selectProfile]
  )

  // Update entity naming preference
  const updateEntityNaming = React.useCallback(
    (partial: Partial<EntityNamingPreferences>) => {
      setPreferences((prev) => {
        const next: UserPreferences = {
          ...prev,
          entityNaming: {
            ...prev.entityNaming,
            ...partial,
          },
        }
        try {
          localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(next))
        } catch {
          // Ignore
        }
        return next
      })
    },
    []
  )

  // Update display preference
  const updateDisplay = React.useCallback(
    (partial: Partial<DisplayPreferences>) => {
      setPreferences((prev) => {
        const next: UserPreferences = {
          ...prev,
          display: {
            ...prev.display,
            ...partial,
          },
        }
        try {
          localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(next))
        } catch {
          // Ignore
        }
        return next
      })
    },
    []
  )

  // Reset to defaults
  const resetToDefaults = React.useCallback(() => {
    setActiveProfileId("standard-accounting")
    savePreferences(DEFAULT_PREFERENCES)
    try {
      localStorage.setItem(STORAGE_ACTIVE_PROFILE_KEY, "standard-accounting")
    } catch {
      // Ignore
    }
  }, [savePreferences])

  const { singular: clientLabelSingular, plural: clientLabelPlural } = React.useMemo(() => {
    return getClientLabels(preferences.entityNaming)
  }, [preferences.entityNaming])

  const value = React.useMemo(
    () => ({
      preferences,
      activeProfileId,
      profiles,
      clientLabelSingular,
      clientLabelPlural,
      isHydrated,
      selectProfile,
      saveAsNewProfile,
      deleteProfile,
      updateEntityNaming,
      updateDisplay,
      resetToDefaults,
    }),
    [
      preferences,
      activeProfileId,
      profiles,
      clientLabelSingular,
      clientLabelPlural,
      isHydrated,
      selectProfile,
      saveAsNewProfile,
      deleteProfile,
      updateEntityNaming,
      updateDisplay,
      resetToDefaults,
    ]
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = React.useContext(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
