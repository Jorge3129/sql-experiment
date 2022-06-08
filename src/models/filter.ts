import {ColumnValue} from "./table";

export interface IFilter {
    name: string,
    value: ColumnValue,
    func: (a: any, b: any) => boolean
}