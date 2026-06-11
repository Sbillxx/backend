import { router } from "@inertiajs/react"

export class ValidationError extends Error {
  constructor(public readonly errors: Record<string, any>) {
    super("Validation error")
  }
}

export function makeRequest<R>(props: {
  url: URL | string
  method: string
  data?: Record<string, any>
  onSuccess?: (...args: any[]) => void
  onError?: (errors: any) => void
  onFinish?: () => void
}) {
  const options = {
    method: props.method as any,
    data: props.data,
    onError: (errors: any) => {
      if (props.onError) {
        props.onError(errors)
      }
    },
    onSuccess: (...args: any[]) => {
      if (props.onSuccess) {
        props.onSuccess(...args)
      }
    },
    onFinish: props.onFinish,
  }

  router.visit(props.url, options)
}
