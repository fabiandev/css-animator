export interface TimeoutRef {
    [key: string]: any;
    timeout: number;
    reject?: Function;
}
