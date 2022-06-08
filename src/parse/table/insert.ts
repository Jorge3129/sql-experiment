import {database} from "../../db/database";
import {ColumnType, ITable, IValue} from "../../models/table";
import {formatValue, getNumber, getString, isNumber, isString} from "../../models/getType";

export const execInsertQuery = (query: string) => {
    // console.log('INSERT')

    const tableName = matchTableName(query)
    if (!tableName) throw new Error(`Incorrect syntax: no table name provided`)
    const table = database.tables.find(t => t.name === tableName.toLowerCase())
    if (!table) throw new Error(`Table ${tableName} does not exist`)
    const columnNames = extractColumnNames(query)
    const values = extractValues(query)
    checkColumnAndValueMatch(table, columnNames, values)
    table.rows.push(createRow(table, columnNames, values))
    return table.rows;
}

const createRow = (table: ITable, columnNames: string[], values: string[]) => {
    //
    const typedColumns = Object.values(table.schema)
    const defaults = typedColumns.filter(c => c.default !== undefined)
    const defaultObj = defaults.reduce((acc, column) => ({...acc, [column.name]: column.default}), {} as Object)
    //
    const autoNames = typedColumns.filter(c => c.autoIncrement)
        .map(c => c.name)
    autoNames.forEach(name => {
        const value = table[name]
        if (!value) table[name] = 1;
        else table[name] = value + 1
    })
    const autoObj = autoNames.reduce((acc, name) => ({...acc, [name]: table[name]}), {} as Object)
    //
    const typedValues = convertValuesToTypes(values)
    const valueObj = columnNames.reduce((acc, name, i) =>
        ({...acc, [name]: typedValues[i].value}), {} as Object)
    //
    return Object.assign({}, defaultObj, autoObj, valueObj)
}

const matchTableName = (query: string) => {
    const tableNameResults = query.match(/(?<=insert into )\w+/gi)
    return tableNameResults ? tableNameResults[0] : null
}

const checkColumnAndValueMatch = (table: ITable, columnNames: string[], values: string[]) => {
    if (columnNames.length !== values.length)
        throw new Error(`Incorrect syntax: number of column names does not match the number of values`)
    const typedColumns = convertColumnsToTypes(table, columnNames)
    const typedValues = convertValuesToTypes(values)
    typedColumns.forEach((col, i) => {
        const {value, type} = typedValues[i]
        if (col.type !== type)
            throw new Error(`Type mismatch: ${type} ${formatValue(value)} is not assignable to column ${col.name} of type ${col.type}`)
    })
}

export const convertValuesToTypes = (values: string[]) => values.map(convertOneValueToType)

export const convertOneValueToType = (value): IValue => {
    if (isString(value))
        return {value: getString(value), type: ColumnType.string}
    else if (isNumber(value))
        return {value: getNumber(value), type: ColumnType.number}
    else throw new Error(`Incorrect syntax: value must be string or number`)
}

const convertColumnsToTypes = (table: ITable, columns: string[]) => {
    const {schema} = table;
    return columns.map((column) => {
        if (!schema[column])
            throw new Error(`Column '${column}' does not exist in table ${table.name}`)
        return schema[column]
    })
}

const extractColumnNames = (query: string): string[] => {
    return query
        .replace(/insert into \w+ \(/gi, '')
        .replace(/\)[\n\s]*values.*/gi, '')
        .replace(/(\n+)/gi, '')
        .replace(/(\s{2,})/gi, '')
        .split(', ')
        .map(name => name.toLowerCase().replace(/\s*/gi, ''))
}

const extractValues = (query: string) => {
    return query
        .replace(/\);[\n\s]*/gi, '')
        .replace(/(\n+)/gi, '')
        .replace(/(\s{2,})/gi, '')
        .replace(/insert into \w+.*values\s?\(/gi, '')
        .split(', ')
}