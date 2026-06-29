export interface GridData {
  width: number;
  height: number;
  pixels: string[];
}

export interface DrawingPreview {
  id: string;
  title: string;
  gridData: GridData;
  isPublished: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}