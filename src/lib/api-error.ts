export class ApiError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "ApiError"
    this.code = code
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) {
    const message = error.message.replace(/^AxiosError:\s*/, "").replace(/\s*\{.*\}$/, "")
    return message || "Something went wrong. Please try again."
  }
  return "Something went wrong. Please try again."
}
