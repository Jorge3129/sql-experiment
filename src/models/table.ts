export enum ColumnType {
    number = "number",
    string = "string"
}

export type ColumnValue = string | number

export interface IColumn {
    name: string
    type: ColumnType
    notNull: boolean
    autoIncrement: boolean
    primaryKey?: boolean
    default?: any
}

export interface IValue {
    value: ColumnValue
    type: ColumnType
}

export type ISchema = { [key: string]: IColumn }

export interface ITable {
    name: string
    schema: ISchema
    rows: Object[]
}

class Table implements Omit<ITable, 'name'> {
    name: string;
    rows: Object[] = [];
    schema: ISchema;
    constructor() {}

}