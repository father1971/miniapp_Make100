import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — ловит ошибки React-дерева и показывает fallback UI
 * вместо белого экрана.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-[100dvh] w-full bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-6">😵</div>
          <h1 className="text-2xl font-bold mb-3">Что-то пошло не так</h1>
          <p className="text-sm text-zinc-400 mb-6 max-w-sm">
            Произошла неожиданная ошибка. Попробуйте перезагрузить приложение.
          </p>
          {this.state.error && (
            <details className="mb-6 text-xs text-zinc-500 max-w-sm text-left">
              <summary className="cursor-pointer hover:text-zinc-300 transition-colors">
                Подробности ошибки
              </summary>
              <pre className="mt-2 p-3 bg-zinc-900 rounded-xl overflow-auto max-h-32 text-zinc-400">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
