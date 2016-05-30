export interface TimeoutRef {
  [key: string]: any;

  element: HTMLElement;
  timeout: number;
  reject?: Function;
}
