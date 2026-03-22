import { Component } from "react"
import { withTranslation } from "react-i18next"

import type { ErrorInfo, ReactNode } from "react"
import type { WithTranslation } from "react-i18next"

interface ErrorBoundaryOwnProps {
  readonly children: ReactNode
}

type ErrorBoundaryProps = ErrorBoundaryOwnProps & WithTranslation

interface ErrorBoundaryState {
  readonly hasError: boolean
}

class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { t } = this.props

      return (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"
          role="alert"
        >
          <h2 className="text-lg font-semibold text-foreground">
            {t("error.heading")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("error.message")}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="min-h-[44px] rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("error.reload")}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryClass)
