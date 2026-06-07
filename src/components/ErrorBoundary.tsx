import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Sentry } from '../lib/sentry';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Mock Pass crashed:', error, info);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  handleReset(): void {
    this.setState({ hasError: false, error: null });
  }

  handleReload(): void {
    window.location.reload();
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface text-on-surface font-sans flex items-center justify-center p-6">
          <div className="bg-surface-container border border-outline-variant rounded max-w-md w-full p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-error-container border border-outline-variant flex items-center justify-center rounded-sm mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Something went wrong</h1>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              The app hit an unexpected error. You can try recovering your session or reload the page.
            </p>
            {this.state.error && (
              <pre className="text-left text-[10px] text-on-surface-variant bg-surface-dim border border-outline-variant rounded p-3 mb-6 overflow-auto max-h-32 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 border border-outline-variant text-on-surface font-bold uppercase tracking-widest text-xs hover:bg-surface-variant transition-all"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
