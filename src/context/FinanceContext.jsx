// Re-exports the domain FinanceContext so legacy imports (e.g. Settings.jsx)
// resolve to the same context as the new domain structure.
// eslint-disable-next-line react-refresh/only-export-components
export { FinanceProvider, useFinance } from '../domains/finance/context/FinanceContext';
