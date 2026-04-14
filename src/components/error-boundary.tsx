import { Component } from "react"
import { withTranslation } from "react-i18next"

import type { ErrorInfo, ReactNode } from "react"
import type { WithTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

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
          <Button
            className="min-h-[44px] md:min-h-0"
            onClick={() => window.location.reload()}
          >
            {t("error.reload")}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryClass)
