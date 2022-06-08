import {ColumnType} from "./table";


export const getType = (type: string) => {
    if (type.includes('char')) return ColumnType.string
    else if (type === "int") return ColumnType.number
}

export const isString = (value: string) => {
    return value.startsWith("'") && value.endsWith("'")
}

export const getString = (value: string) => {
    return value.replace(/'/gi, '')
}

export const formatValue = (value: string | number) => {
    return typeof value === "string" ? `'${value}'` : '' + value;
}

export const isNumber = (value: string) => {
    return !isNaN(parseInt(value))
}

export const getNumber = (value: string) => {
    return parseInt(value)
}