export interface ListenerRef {
    [key: string]: any;
    eventName: string;
    handler: () => any;
    reject?: Function;
}
