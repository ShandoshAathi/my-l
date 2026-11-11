import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Heart } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-pastel-blush text-center">
          <div className="max-w-md w-full rounded-3xl glass-card p-8 shadow-glass border border-pastel-pink/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-pink/60 text-pastel-rose mb-4 animate-bounce">
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <h2 className="font-romantic text-3xl font-bold text-gray-800">
              A gentle surprise pause ♡
            </h2>
            <p className="font-anime text-sm text-gray-600 mt-2 mb-6">
              A little sparkle needed a moment to bloom. Click below to continue your romantic journey.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Surprise</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
