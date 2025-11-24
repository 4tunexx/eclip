type LogLevel = "info" | "warn" | "error" | "debug"

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = { level, message, meta, ts: new Date().toISOString() }
  const serialized = JSON.stringify(payload)
  if (level === "error") {
    console.error(serialized)
    return
  }
  if (level === "warn") {
    console.warn(serialized)
    return
  }
  console.log(serialized)
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta)
}
