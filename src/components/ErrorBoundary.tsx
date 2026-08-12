import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled app exception caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 rounded-2xl shadow-2xl space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Application View Recovered
          </h2>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            {this.state.error?.message || 'An unexpected rendering issue occurred in this section.'}
          </p>

          <div className="pt-2">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset Module View
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
