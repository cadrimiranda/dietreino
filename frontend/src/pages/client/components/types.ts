import { ICommonClientData } from "@/composables/useUsers";

export interface IClientData extends ICommonClientData {
  trainingStatus: string;
  dietStatus: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
