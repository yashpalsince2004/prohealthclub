import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard component crashed:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.fallbackCustom()) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 min-h-[300px] flex flex-col items-center justify-center text-center bg-[#111820]/40 backdrop-blur-md border border-red-500/20 rounded-3xl space-y-4 max-w-lg mx-auto shadow-2xl">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
            <AlertOctagon size={32} />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              {this.props.moduleName || "Component"} Error
            </h3>
            <p className="text-[11px] text-slate-400 font-medium max-w-sm leading-relaxed">
              This widget encountered a rendering crash. You can reload this module or return to safety.
            </p>
          </div>

          {this.state.error && (
            <div className="w-full text-left bg-black/40 border border-white/5 p-3.5 rounded-xl max-h-28 overflow-y-auto">
              <code className="text-[9px] font-mono text-red-400 block whitespace-pre-wrap select-text">
                {this.state.error.name}: {this.state.error.message}
              </code>
            </div>
          )}

          <div className="flex items-center gap-3 w-full max-w-xs pt-2">
            <Button
              onClick={this.handleReset}
              className="flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw size={12} className="mr-2" />
              Reload
            </Button>
            <Button
              onClick={this.handleGoHome}
              className="flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white"
            >
              <Home size={12} className="mr-2" />
              Reset Portal
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private fallbackCustom() {
    return this.props.fallback !== undefined;
  }
}
