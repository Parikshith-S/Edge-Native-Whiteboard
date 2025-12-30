export type DrawPoint = {
  x: number;
  y: number;
};

export type DrawStroke = {
  id: string;
  points: DrawPoint[];
  color: string;
  strokeWidth: number;
};