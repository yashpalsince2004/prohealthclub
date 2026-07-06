import { api } from "./api";
import { crudApi, PaginatedResult } from "./crudApi";
import { TrainerResponse } from "./types";

export interface TrainerCreatePayload {
  email: string;
  password?: string;
  full_name: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_relation?: string | null;
  employee_id?: string | null;
  specialization?: string | null;
  specializations?: string[] | null;
  experience_years?: number | null;
  qualification?: string | null;
  certifications?: string[] | null;
  bio?: string | null;
  employment_type?: string | null;
  salary?: number | null;
  salary_type?: string | null;
  shift?: string | null;
  joining_staff_date?: string | null;
  max_members?: number | null;
  working_days?: string[] | null;
  working_hours?: string | null;
}

export interface TrainerUpdatePayload {
  full_name?: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_relation?: string | null;
  avatar_url?: string | null;
  employee_id?: string | null;
  specialization?: string | null;
  specializations?: string[] | null;
  experience_years?: number | null;
  qualification?: string | null;
  certifications?: string[] | null;
  bio?: string | null;
  is_available?: boolean;
  is_active?: boolean;
  employment_type?: string | null;
  salary?: number | null;
  salary_type?: string | null;
  shift?: string | null;
  joining_staff_date?: string | null;
  max_members?: number | null;
  working_days?: string[] | null;
  working_hours?: string | null;
}

export const trainerService = {
  /**
   * Fetch trainers paginated and filtered list
   */
  async getTrainers(params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    shift?: string;
    employment_type?: string;
    specialization?: string;
    experience_min?: number;
    experience_max?: number;
    show_archived?: boolean;
  }): Promise<PaginatedResult<TrainerResponse>> {
    return crudApi.fetchList<TrainerResponse>("/api/v1/trainers", params);
  },

  /**
   * Retrieve trainer details by UUID
   */
  async getTrainerById(id: string): Promise<TrainerResponse> {
    return crudApi.fetchById<TrainerResponse>("/api/v1/trainers", id);
  },

  /**
   * Create trainer
   */
  async createTrainer(payload: TrainerCreatePayload): Promise<TrainerResponse> {
    return crudApi.createItem<any, TrainerResponse>("/api/v1/trainers", payload);
  },

  /**
   * Update trainer
   */
  async updateTrainer(id: string, payload: TrainerUpdatePayload): Promise<TrainerResponse> {
    return crudApi.updateItem<any, TrainerResponse>("/api/v1/trainers", id, payload);
  },

  /**
   * Archive (soft delete) trainer record
   */
  async archiveTrainer(id: string): Promise<void> {
    return crudApi.deleteItem("/api/v1/trainers", id);
  },

  /**
   * Restore archived trainer record
   */
  async restoreTrainer(id: string): Promise<void> {
    return api.post<void>(`/api/v1/trainers/${id}/restore`, {});
  },

  /**
   * Fetch trainer stats
   */
  async getTrainerStats(): Promise<any> {
    const res = await api.get<any>("/api/v1/trainers/stats");
    return res?.data || res || {};
  },

  /**
   * Bulk operations
   */
  async bulkArchive(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/trainers/bulk-archive", { ids });
  },

  async bulkRestore(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/trainers/bulk-restore", { ids });
  },

  async bulkChangeShift(ids: string[], shift: string): Promise<void> {
    return api.post<void>("/api/v1/trainers/bulk-change-shift", { ids, shift });
  },

  async bulkActivate(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/trainers/bulk-activate", { ids });
  },

  async bulkDeactivate(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/trainers/bulk-deactivate", { ids });
  },

  /**
   * Coaching roster management
   */
  async assignMember(trainerId: string, memberId: string): Promise<void> {
    return api.post<void>(`/api/v1/trainers/${trainerId}/assign-member`, { member_id: memberId });
  },

  async unassignMember(trainerId: string, memberId: string): Promise<void> {
    return api.delete<void>(`/api/v1/trainers/${trainerId}/unassign-member`, { member_id: memberId });
  },

  /**
   * Helper to fetch members list (for roster assignment dropdown / search)
   */
  async getMembers(): Promise<any[]> {
    const res = await api.get<any>("/api/v1/members/?per_page=100");
    return res?.data || res || [];
  }
};
