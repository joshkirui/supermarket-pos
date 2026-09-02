import { Component, ReactNode } from 'react'

export default class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pos-bg flex items-center justify-center p-8">
          <div className="card max-w-lg text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-4">{this.state.error}</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }} className="btn-primary">
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
