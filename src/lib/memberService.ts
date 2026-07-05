import { api } from "./api";
import { crudApi, PaginatedResult } from "./crudApi";

export interface ProfileData {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  biometric_device_id?: number;
  email?: string;
}

export interface ActiveMembership {
  id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: string;
  days_remaining: number;
}

export interface TrainerSummary {
  id: string;
  full_name: string;
  specialization?: string;
}

export interface Member {
  id: string;
  joining_date: string;
  notes?: string;
  profile: ProfileData;
  active_membership?: ActiveMembership;
  is_active: boolean;
  last_visit?: string;
  assigned_trainer?: TrainerSummary;
}

export interface MemberCreatePayload {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_relation?: string;
  medical_notes?: string;
  occupation?: string;
  height?: number;
  weight?: number;
  joining_date?: string;
  notes?: string;
  plan_id?: string;
  trainer_id?: string;
}

export interface MemberUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_relation?: string;
  medical_notes?: string;
  occupation?: string;
  height?: number;
  weight?: number;
  notes?: string;
  is_active?: boolean;
  biometric_device_id?: number;
}

export const memberService = {
  /**
   * Fetch members paginated and filtered list
   */
  async getMembers(params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    gender?: string;
    plan_id?: string;
    trainer_id?: string;
    join_from?: string;
    join_to?: string;
    is_active?: boolean;
    show_archived?: boolean;
  }): Promise<PaginatedResult<Member>> {
    return crudApi.fetchList<Member>("/api/v1/members", params);
  },

  /**
   * Retrieve member details by UUID
   */
  async getMemberById(id: string): Promise<Member> {
    return crudApi.fetchById<Member>("/api/v1/members", id);
  },

  /**
   * Create member, profile, and active plan
   */
  async createMember(payload: MemberCreatePayload): Promise<Member> {
    // Generate a secure random password if not provided
    if (!payload.password) {
      payload.password = generateSecurePassword();
    }
    return crudApi.createItem<MemberCreatePayload, Member>("/api/v1/members", payload);
  },

  /**
   * Update member administrative fields and notes
   */
  async updateMember(id: string, payload: MemberUpdatePayload): Promise<Member> {
    return crudApi.updateItem<MemberUpdatePayload, Member>("/api/v1/members", id, payload);
  },

  /**
   * Archive (soft delete) member record
   */
  async archiveMember(id: string): Promise<void> {
    return crudApi.deleteItem("/api/v1/members", id);
  },

  /**
   * Restore archived member record
   */
  async restoreMember(id: string): Promise<void> {
    return api.post<void>(`/api/v1/members/${id}/restore`, {});
  },

  /**
   * Bulk operations
   */
  async bulkArchive(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/members/bulk-archive", { ids });
  },

  async bulkRestore(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/members/bulk-restore", { ids });
  },

  async bulkAssignTrainer(memberIds: string[], trainerId: string): Promise<void> {
    return api.post<void>("/api/v1/members/bulk-assign-trainer", {
      member_ids: memberIds,
      trainer_id: trainerId
    });
  },

  async bulkChangePlan(memberIds: string[], planId: string): Promise<void> {
    return api.post<void>("/api/v1/members/bulk-change-plan", {
      member_ids: memberIds,
      plan_id: planId
    });
  },

  async bulkActivate(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/members/bulk-activate", { ids });
  },

  async bulkDeactivate(ids: string[]): Promise<void> {
    return api.post<void>("/api/v1/members/bulk-deactivate", { ids });
  },

  /**
   * Lookup options helper
   */
  async getTrainers(): Promise<any[]> {
    const res = await api.get<any>("/api/v1/trainers/?per_page=100");
    return res?.data || res || [];
  },

  async getPlans(): Promise<any[]> {
    const res = await api.get<any>("/api/v1/plans/?active_only=true");
    return res?.data || res || [];
  },

  async getMemberStats(): Promise<any> {
    const res = await api.get<any>("/api/v1/members/stats");
    return res?.data || res || {
      total_members: 0,
      active_members: 0,
      inactive_members: 0,
      expired_memberships: 0
    };
  },

  async extendMembership(membershipId: string, days: number, notes?: string): Promise<any> {
    return api.post<any>(`/api/v1/memberships/${membershipId}/extend`, { extend_days: days, notes });
  },

  async freezeMembership(membershipId: string, notes?: string): Promise<any> {
    return api.post<any>(`/api/v1/memberships/${membershipId}/freeze`, { notes });
  },

  async unfreezeMembership(membershipId: string): Promise<any> {
    return api.post<any>(`/api/v1/memberships/${membershipId}/unfreeze`, {});
  },

  async upgradeMembership(membershipId: string, newPlanId: string, notes?: string): Promise<any> {
    return api.post<any>(`/api/v1/memberships/${membershipId}/upgrade`, { new_plan_id: newPlanId, notes });
  },

  async cancelMembership(membershipId: string, notes?: string): Promise<any> {
    return api.patch<any>(`/api/v1/memberships/${membershipId}/status`, { status: "cancelled", notes });
  }
};

/**
 * Password generator matching the password strength requirements:
 * At least 1 uppercase, 1 lowercase, 1 digit, min 8 chars
 */
function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;

  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];

  for (let i = 0; i < 9; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split("").sort(() => 0.5 - Math.random()).join("");
}
