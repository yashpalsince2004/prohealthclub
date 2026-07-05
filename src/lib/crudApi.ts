import { api } from "./api";

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const crudApi = {
  /**
   * Fetch paginated list of items with search query and filters
   */
  async fetchList<T>(
    path: string,
    params: {
      page?: number;
      per_page?: number;
      search?: string;
      [key: string]: any;
    } = {}
  ): Promise<PaginatedResult<T>> {
    const queryParts: string[] = [];
    
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        queryParts.push(`${key}=${encodeURIComponent(String(val))}`);
      }
    });

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const res = await api.get<any>(`${path}${queryString}`);
    
    // Normalize response formats
    if (res && res.data && Array.isArray(res.data)) {
      return {
        data: res.data,
        page: res.page || params.page || 1,
        limit: res.limit || params.per_page || 50,
        total: res.total || res.data.length,
        total_pages: res.total_pages || 1
      };
    }
    
    // Direct array fallback
    if (Array.isArray(res)) {
      return {
        data: res,
        page: 1,
        limit: res.length,
        total: res.length,
        total_pages: 1
      };
    }

    return {
      data: [],
      page: 1,
      limit: 50,
      total: 0,
      total_pages: 1
    };
  },

  /**
   * Fetch details of a single item by UUID key
   */
  async fetchById<T>(path: string, id: string): Promise<T> {
    return api.get<T>(`${path}/${id}`);
  },

  /**
   * Create a new item record
   */
  async createItem<T, R = T>(path: string, payload: T): Promise<R> {
    return api.post<R>(`${path}/`, payload as any);
  },

  /**
   * Update item record by ID
   */
  async updateItem<T, R = T>(path: string, id: string, payload: T): Promise<R> {
    return api.patch<R>(`${path}/${id}`, payload as any);
  },

  /**
   * Delete item record
   */
  async deleteItem(path: string, id: string): Promise<void> {
    return api.delete<void>(`${path}/${id}`);
  },

  /**
   * Bulk action: delete multiple items
   */
  async bulkDelete(path: string, ids: string[]): Promise<void> {
    return api.post<void>(`${path}/bulk-delete`, { ids });
  },

  /**
   * Bulk action: archive multiple items
   */
  async bulkArchive(path: string, ids: string[]): Promise<void> {
    return api.post<void>(`${path}/bulk-archive`, { ids });
  },

  /**
   * Bulk action: restore multiple archived items
   */
  async bulkRestore(path: string, ids: string[]): Promise<void> {
    return api.post<void>(`${path}/bulk-restore`, { ids });
  }
};
export default crudApi;
