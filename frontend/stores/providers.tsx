'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { initialBootState } from 'stores/features/masterSlice'

// import { initialBootState } from './features/masterSlice'
import { AppStore, makeStore } from 'stores/strore'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    storeRef.current.dispatch(initialBootState());

  }

  return <Provider store={storeRef.current}>{children}</Provider>
}