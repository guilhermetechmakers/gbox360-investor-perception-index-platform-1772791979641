import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { LoadingModal } from "./LoadingModal"
import { SuccessModal } from "./SuccessModal"
import { ErrorModal } from "./ErrorModal"
import type { ModalAction } from "./SuccessModal"
import type { ErrorModalAction } from "./ErrorModal"

export interface LoadingModalState {
  open: boolean
  title?: string
  subtitle?: string
  progress?: number | string
}

export interface SuccessModalState {
  open: boolean
  title?: string
  message?: string
  primaryAction?: ModalAction
  secondaryAction?: ModalAction
  showViewResults?: boolean
  resultsHref?: string
}

export interface ErrorModalState {
  open: boolean
  title?: string
  errorMessage?: string
  retryAction?: ErrorModalAction
  supportLink?: string
}

interface ModalContextValue {
  loading: LoadingModalState
  success: SuccessModalState
  error: ErrorModalState
  showLoading: (opts?: Partial<Omit<LoadingModalState, "open">>) => void
  hideLoading: () => void
  showSuccess: (opts?: Partial<Omit<SuccessModalState, "open">>) => void
  hideSuccess: () => void
  showError: (opts?: Partial<Omit<ErrorModalState, "open">>) => void
  hideError: () => void
}

const defaultLoading: LoadingModalState = { open: false }
const defaultSuccess: SuccessModalState = { open: false }
const defaultError: ErrorModalState = { open: false }

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<LoadingModalState>(defaultLoading)
  const [success, setSuccess] = useState<SuccessModalState>(defaultSuccess)
  const [error, setError] = useState<ErrorModalState>(defaultError)

  const showLoading = useCallback(
    (opts?: Partial<Omit<LoadingModalState, "open">>) => {
      setLoading({
        open: true,
        title: opts?.title ?? "Loading…",
        subtitle: opts?.subtitle ?? "",
        progress: opts?.progress,
      })
    },
    []
  )

  const hideLoading = useCallback(() => {
    setLoading((prev) => ({ ...prev, open: false }))
  }, [])

  const showSuccess = useCallback(
    (opts?: Partial<Omit<SuccessModalState, "open">>) => {
      const primary = opts?.primaryAction ?? {
        label: "Continue",
        onClick: () => {},
      }
      setSuccess({
        open: true,
        title: opts?.title ?? "Success",
        message: opts?.message ?? "",
        primaryAction: primary,
        secondaryAction: opts?.secondaryAction,
        showViewResults: opts?.showViewResults ?? false,
        resultsHref: opts?.resultsHref ?? "",
      })
    },
    []
  )

  const hideSuccess = useCallback(() => {
    setSuccess((prev) => ({ ...prev, open: false }))
  }, [])

  const showError = useCallback(
    (opts?: Partial<Omit<ErrorModalState, "open">>) => {
      setError({
        open: true,
        title: opts?.title ?? "Something went wrong",
        errorMessage: opts?.errorMessage ?? "An unexpected error occurred.",
        retryAction: opts?.retryAction,
        supportLink: opts?.supportLink ?? "",
      })
    },
    []
  )

  const hideError = useCallback(() => {
    setError((prev) => ({ ...prev, open: false }))
  }, [])

  const value: ModalContextValue = {
    loading,
    success,
    error,
    showLoading,
    hideLoading,
    showSuccess,
    hideSuccess,
    showError,
    hideError,
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
      <LoadingModal
        open={loading.open}
        title={loading.title}
        subtitle={loading.subtitle || undefined}
        optionalProgress={loading.progress}
        onDismiss={hideLoading}
      />
      <SuccessModal
        open={success.open}
        title={success.title}
        message={success.message}
        primaryAction={
          success.primaryAction ?? { label: "Continue", onClick: hideSuccess }
        }
        secondaryAction={success.secondaryAction}
        showViewResults={success.showViewResults}
        resultsHref={success.resultsHref}
        onClose={hideSuccess}
      />
      <ErrorModal
        open={error.open}
        title={error.title}
        errorMessage={error.errorMessage}
        retryAction={error.retryAction}
        supportLink={error.supportLink}
        onClose={hideError}
      />
    </ModalContext.Provider>
  )
}

export function useModals(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error("useModals must be used within a ModalProvider")
  }
  return ctx
}
