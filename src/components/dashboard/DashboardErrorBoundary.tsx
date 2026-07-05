import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home, Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard component crashed:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      copied: false,
      showDetails: false
    });
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.replace("/admin");
    }
  };

  private handleCopyError = () => {
    if (!this.state.error) return;
    const details = `
Module: ${this.props.moduleName || "General Component"}
Error Name: ${this.state.error.name}
Error Message: ${this.state.error.message}
Stack Trace:
${this.state.error.stack || "N/A"}
Component Stack:
${this.state.errorInfo?.componentStack || "N/A"}
    `.trim();

    navigator.clipboard.writeText(details);
    this.setState({ copied: true });
    toast.success("Stack trace copied to clipboard!");
    
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  };

  public render() {
    if (this.state.hasError) {
      if (this.fallbackCustom()) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 min-h-[360px] flex flex-col items-center justify-center text-center bg-[#111820]/40 backdrop-blur-md border border-red-500/10 rounded-3xl space-y-5 max-w-lg mx-auto shadow-2xl animate-in zoom-in-95 duration-250">
          <div className="p-3.5 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
            <AlertOctagon size={32} />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {this.props.moduleName || "System Module"} Crash
            </h3>
            <p className="text-[11px] text-slate-400 font-medium max-w-sm leading-relaxed">
              An unexpected error occurred during rendering. You can try reloading or copying diagnostics for support.
            </p>
          </div>

          {this.state.error && (
            <div className="w-full text-left bg-black/40 border border-white/5 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Diagnostics Info
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                    className="text-[9px] font-bold text-[#FF6B00] hover:underline"
                  >
                    {this.state.showDetails ? "Hide Stack" : "View Stack"}
                  </button>
                  <button
                    type="button"
                    onClick={this.handleCopyError}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    {this.state.copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <code className="text-[9px] font-mono text-red-400 block whitespace-pre-wrap select-text max-h-24 overflow-y-auto pr-1">
                {this.state.error.name}: {this.state.error.message}
                {this.state.showDetails && (
                  <>
                    {"\n\n--- Stack Trace ---\n"}
                    {this.state.error.stack}
                  </>
                )}
              </code>
            </div>
          )}

          <div className="flex items-center gap-3 w-full max-w-sm pt-2">
            <Button
              onClick={this.handleReset}
              className="flex-1 h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw size={12} className="mr-2 animate-pulse" />
              Retry Module
            </Button>
            <Button
              onClick={this.handleGoHome}
              className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#FF6B00] hover:bg-[#FF8020] text-white"
            >
              <Home size={12} className="mr-2" />
              Go Dashboard
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
