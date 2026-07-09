import { api } from "./api";
import { crudApi, PaginatedResult } from "./crudApi";
import { ReceptionistResponse, ReceptionistCreatePayload, ReceptionistUpdatePayload } from "./types";

export const receptionistService = {
  /**
   * Fetch receptionists list paginated and filtered
   */
  async getReceptionists(params: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
    show_archived?: boolean;
  }): Promise<PaginatedResult<ReceptionistResponse>> {
    return crudApi.fetchList<ReceptionistResponse>("/api/v1/receptionists", params);
  },

  /**
   * Retrieve receptionist details by UUID
   */
  async getReceptionistById(id: string): Promise<ReceptionistResponse> {
    return crudApi.fetchById<ReceptionistResponse>("/api/v1/receptionists", id);
  },

  /**
   * Create receptionist account
   */
  async createReceptionist(payload: ReceptionistCreatePayload): Promise<ReceptionistResponse> {
    return crudApi.createItem<any, ReceptionistResponse>("/api/v1/receptionists", payload);
  },

  /**
   * Update receptionist profile
   */
  async updateReceptionist(id: string, payload: ReceptionistUpdatePayload): Promise<ReceptionistResponse> {
    return crudApi.updateItem<any, ReceptionistResponse>("/api/v1/receptionists", id, payload);
  },

  /**
   * Archive (soft delete) receptionist record
   */
  async archiveReceptionist(id: string): Promise<void> {
    return crudApi.deleteItem("/api/v1/receptionists", id);
  },

  /**
   * Restore archived receptionist record
   */
  async restoreReceptionist(id: string): Promise<void> {
    return api.post<void>(`/api/v1/receptionists/${id}/restore`, {});
  },

  /**
   * Fetch receptionist stats
   */
  async getReceptionistStats(): Promise<any> {
    const res = await api.get<any>("/api/v1/receptionists/stats");
    return res?.data || res || {};
  },

  /**
   * Bulk operations
   */
  async bulkArchive(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/receptionists/bulk-archive", { ids });
  },

  async bulkRestore(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/receptionists/bulk-restore", { ids });
  },

  async bulkChangeShift(ids: string[], shift: string): Promise<void> {
    return api.post<void>("/api/v1/receptionists/bulk-change-shift", { ids, shift });
  },

  async bulkActivate(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/receptionists/bulk-activate", { ids });
  },

  async bulkDeactivate(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/receptionists/bulk-deactivate", { ids });
  }
};
