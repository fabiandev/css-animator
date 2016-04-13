export interface ListenerRef {
    [key: string]: any;
    element: HTMLElement;
    eventName: string;
    handler: () => any;
    reject: Function;
}
