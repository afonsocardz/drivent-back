import { ApplicationError } from "@/protocols";

interface ActivitiesErrors {
  NOT_PAID: "Você precisa ter confirmado pagamento antes de fazer a escolha de atividades",
  TOTAL_ACCESS: "Sua modalidade de ingresso não necessita escolher atividade. Você terá acesso a todas as atividades."
}

export const ActivityError: ActivitiesErrors = {
  NOT_PAID: "Você precisa ter confirmado pagamento antes de fazer a escolha de atividades",
  TOTAL_ACCESS: "Sua modalidade de ingresso não necessita escolher atividade. Você terá acesso a todas as atividades."
};

export function cannotListActivitiesError(message: string): ApplicationError {
  return {
    name: "cannotListActivitiesError",
    message,
  };
}
