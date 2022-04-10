export type Route = {
    path: string,
    view: any,
    outlet?: string,
    children?: Route[]
}