export interface RequestConInquilino extends Request {
  inquilinoId?: string;
  user?: {
    id: string;
    inquilinoId: string;
  };
}