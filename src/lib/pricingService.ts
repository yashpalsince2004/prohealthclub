import { api } from "./api";
import { crudApi, PaginatedResult } from "./crudApi";
import { PlanResponse, PTPlan, LockerPlan, AdditionalService } from "./types";

export const pricingService = {
  // Membership Plans CRUD
  async getMembershipPlans(params: { active_only?: boolean } = {}): Promise<PlanResponse[]> {
    const activeQuery = params.active_only !== undefined ? `?active_only=${params.active_only}` : "";
    const res = await api.get<any>(`/api/v1/plans${activeQuery}`);
    return res?.data || res || [];
  },

  async getMembershipPlanById(id: string): Promise<PlanResponse> {
    const res = await api.get<any>(`/api/v1/plans/${id}`);
    return res?.data || res;
  },

  async createMembershipPlan(payload: any): Promise<PlanResponse> {
    const res = await api.post<any>("/api/v1/plans/", payload);
    return res?.data || res;
  },

  async updateMembershipPlan(id: string, payload: any): Promise<PlanResponse> {
    const res = await api.patch<any>(`/api/v1/plans/${id}`, payload);
    return res?.data || res;
  },

  async deleteMembershipPlan(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/plans/${id}`);
  },

  // PT Plans CRUD
  async getPTPlans(params: { active_only?: boolean } = {}): Promise<PTPlan[]> {
    const activeQuery = params.active_only !== undefined ? `?active_only=${params.active_only}` : "";
    const res = await api.get<any>(`/api/v1/pt-plans${activeQuery}`);
    return res?.data || res || [];
  },

  async getPTPlanById(id: string): Promise<PTPlan> {
    const res = await api.get<any>(`/api/v1/pt-plans/${id}`);
    return res?.data || res;
  },

  async createPTPlan(payload: any): Promise<PTPlan> {
    const res = await api.post<any>("/api/v1/pt-plans/", payload);
    return res?.data || res;
  },

  async updatePTPlan(id: string, payload: any): Promise<PTPlan> {
    const res = await api.patch<any>(`/api/v1/pt-plans/${id}`, payload);
    return res?.data || res;
  },

  async deletePTPlan(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/pt-plans/${id}`);
  },

  // Locker Plans CRUD
  async getLockerPlans(params: { active_only?: boolean } = {}): Promise<LockerPlan[]> {
    const activeQuery = params.active_only !== undefined ? `?active_only=${params.active_only}` : "";
    const res = await api.get<any>(`/api/v1/locker-plans${activeQuery}`);
    return res?.data || res || [];
  },

  async getLockerPlanById(id: string): Promise<LockerPlan> {
    const res = await api.get<any>(`/api/v1/locker-plans/${id}`);
    return res?.data || res;
  },

  async createLockerPlan(payload: any): Promise<LockerPlan> {
    const res = await api.post<any>("/api/v1/locker-plans/", payload);
    return res?.data || res;
  },

  async updateLockerPlan(id: string, payload: any): Promise<LockerPlan> {
    const res = await api.patch<any>(`/api/v1/locker-plans/${id}`, payload);
    return res?.data || res;
  },

  async deleteLockerPlan(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/locker-plans/${id}`);
  },

  // Additional Services CRUD
  async getAdditionalServices(params: { active_only?: boolean } = {}): Promise<AdditionalService[]> {
    const activeQuery = params.active_only !== undefined ? `?active_only=${params.active_only}` : "";
    const res = await api.get<any>(`/api/v1/additional-services${activeQuery}`);
    return res?.data || res || [];
  },

  async getAdditionalServiceById(id: string): Promise<AdditionalService> {
    const res = await api.get<any>(`/api/v1/additional-services/${id}`);
    return res?.data || res;
  },

  async createAdditionalService(payload: any): Promise<AdditionalService> {
    const res = await api.post<any>("/api/v1/additional-services/", payload);
    return res?.data || res;
  },

  async updateAdditionalService(id: string, payload: any): Promise<AdditionalService> {
    const res = await api.patch<any>(`/api/v1/additional-services/${id}`, payload);
    return res?.data || res;
  },

  async deleteAdditionalService(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/additional-services/${id}`);
  }
};
