export interface Address {
  id: string;
  name: string;
  type: string; // e.g., 'Tỉnh', 'Thành phố'
  parentId: null | string; // Always null for provinces
}
