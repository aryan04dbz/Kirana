export interface HealthInfo {
  status: string;
  app: string;
  version: string;
  database: string;
}

export interface UserSetting {
  user_id: string;
  key: string;
  value: string;
}

export interface GroceryItemPreview {
  id: string;
  name: string;
  category: string;
  unit: string;
  daysRemaining: number;
  status: "plenty" | "low" | "due";
  stage: "learning" | "assisted" | "auto";
  unopenedCount: number;
}
