import { ApplicationError } from "@/protocols";

export function datetimeConflict(): ApplicationError {
  return {
    name: "datetimeConflict",
    message: "Você já possui atividades nesse horário",
  };
}
