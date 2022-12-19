import { ApplicationError } from "@/protocols";

export function cannotListHotelsError(message: string): ApplicationError {
  return {
    name: "cannotListHotelsError",
    message,
  };
}
