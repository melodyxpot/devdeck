import type { AppError } from "@/types";

export class DevDeckError extends Error {
  readonly appError: AppError;

  constructor(error: AppError) {
    super(error.title);
    this.name = "DevDeckError";
    this.appError = error;
  }
}

export function toAppError(error: unknown, fallback: AppError): AppError {
  if (error instanceof DevDeckError) return error.appError;
  if (error && typeof error === "object" && "title" in error && "reason" in error) {
    return error as AppError;
  }
  return fallback;
}

export const Errors = {
  projectStart: (reason: string, fix: string): AppError => ({
    code: "PROJECT_START_FAILED",
    title: "Unable to start the project.",
    reason,
    fix,
  }),
  toolMissing: (tool: string): AppError => ({
    code: "TOOL_MISSING",
    title: `${tool} was not found.`,
    reason: `${tool} is not installed or is not on PATH.`,
    fix: `Install ${tool} or choose another tool in Settings.`,
  }),
  pathInvalid: (path: string): AppError => ({
    code: "PATH_INVALID",
    title: "That path is not allowed.",
    reason: `The path “${path}” failed security checks.`,
    fix: "Choose a project directory you own. Parent traversal is blocked.",
  }),
  dockerMissing: (): AppError => ({
    code: "DOCKER_MISSING",
    title: "Docker is not available.",
    reason: "Docker is not installed, or the engine is not running.",
    fix: "Install Docker Desktop and start the engine.",
  }),
  confirmRequired: (action: string): AppError => ({
    code: "CONFIRM_REQUIRED",
    title: "Confirmation required.",
    reason: `${action} is destructive and was not confirmed.`,
    fix: "Confirm the action in the dialog if you want to continue.",
  }),
} as const;
