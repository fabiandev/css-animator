export interface AnimationOptions {
  [key: string]: string|number|boolean;
  fixed?: boolean;
  reject?: boolean;
  useVisibility?: boolean;
  pin?: boolean;
  type?: string;
  fillMode?: string;
  timingFunction?: string;
  playState?: string;
  direction?: string;
  duration?: number;
  delay?: number;
  iterationCount?: number|string;
}
