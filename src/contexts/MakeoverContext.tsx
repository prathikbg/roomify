import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { makeoverReducer, initialState, type MakeoverAction, type MakeoverState } from '../types/makeover';

interface MakeoverContextType {
  state: MakeoverState;
  dispatch: React.Dispatch<MakeoverAction>;
}

const MakeoverContext = createContext<MakeoverContextType | null>(null);

export function MakeoverProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(makeoverReducer, initialState);

  return (
    <MakeoverContext.Provider value={{ state, dispatch }}>
      {children}
    </MakeoverContext.Provider>
  );
}

export function useMakeover() {
  const context = useContext(MakeoverContext);
  if (!context) {
    throw new Error('useMakeover must be used within a MakeoverProvider');
  }
  return context;
}
