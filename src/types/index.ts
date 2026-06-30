export interface GridData {
  width: number;
  height: number;
  pixels: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}