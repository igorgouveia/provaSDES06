'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode
} from 'react'
import { useSession } from 'next-auth/react'

type State = {
  moradores: any[]
  despesas: any[]
  itensCompra: any[]
}

type Action =
  | { type: 'SET_MORADORES'; payload: any[] }
  | { type: 'SET_DESPESAS'; payload: any[] }
  | { type: 'SET_ITENS_COMPRA'; payload: any[] }
  | { type: 'ADD_MORADOR'; payload: any }
  | { type: 'ADD_DESPESA'; payload: any }
  | { type: 'ADD_ITEM_COMPRA'; payload: any }

const initialState: State = {
  moradores: [],
  despesas: [],
  itensCompra: []
}

const AppContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
  refreshMoradores: () => Promise<void>
  refreshDespesas: () => Promise<void>
  refreshItensCompra: () => Promise<void>
  isAdmin: boolean
} | null>(null)

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MORADORES':
      return { ...state, moradores: action.payload }
    case 'SET_DESPESAS':
      return { ...state, despesas: action.payload }
    case 'SET_ITENS_COMPRA':
      return { ...state, itensCompra: action.payload }
    case 'ADD_MORADOR':
      return { ...state, moradores: [...state.moradores, action.payload] }
    case 'ADD_DESPESA':
      return { ...state, despesas: [...state.despesas, action.payload] }
    case 'ADD_ITEM_COMPRA':
      return { ...state, itensCompra: [...state.itensCompra, action.payload] }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === 'ADMIN'

  const refreshMoradores = useCallback(async () => {
    const response = await fetch('/api/moradores')
    const data = await response.json()
    dispatch({ type: 'SET_MORADORES', payload: data })
  }, [])

  const refreshDespesas = useCallback(async () => {
    const response = await fetch('/api/despesas')
    const data = await response.json()
    dispatch({ type: 'SET_DESPESAS', payload: data })
  }, [])

  const refreshItensCompra = useCallback(async () => {
    const response = await fetch('/api/compras')
    const data = await response.json()
    dispatch({ type: 'SET_ITENS_COMPRA', payload: data })
  }, [])

  return (
    <AppContext.Provider
      value={{ 
        state, 
        dispatch, 
        refreshMoradores, 
        refreshDespesas,
        refreshItensCompra,
        isAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
} 