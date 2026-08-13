import { create } from 'zustand'

interface UiState {
  isMobileNavigationOpen: boolean
  setMobileNavigationOpen: (isOpen: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  isMobileNavigationOpen: false,
  setMobileNavigationOpen: (isMobileNavigationOpen) =>
    set({ isMobileNavigationOpen }),
}))
