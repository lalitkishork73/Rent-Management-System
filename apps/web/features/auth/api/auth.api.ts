import { apiClient } from "../../../shared/lib/apiClient";

export async function refresh() {
  const res = await apiClient.post('/auth/refresh');
  return res.data; 
}
