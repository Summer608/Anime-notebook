import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error) {
    console.error("[ErrorBoundary]", err);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-2xl bg-coral/5 p-6 text-center">
          <p className="text-sm text-coral">
            渲染出错了：{this.state.message ?? "未知错误"}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
