import {getType} from "../../models/getType";
import {database} from "../../db/database";
import {IColumn, ISchema} from "../../models/table";
import {convertOneValueToType} from "../table/insert";

export const execCreateQuery = (query: string) => {
    // console.log('CREATE')
    const tableName = matchTableName(query)
    if (!tableName) throw new Error(`Incorrect syntax: no table name provided`)
    if (database.tables.find(t => t.name === tableName))
        throw new Error(`Database with this name already exists`)
    const columns = extractBody(query)
        .split(',')
        .map(parseColumn)
    database.tables.push({
        name: tableName.toLowerCase(),
        schema: createSchema(columns),
        rows: []
    })
    return database.tables;
}

const parseColumn = (column: string) => {
    const tokens = column.split(' ')
    if (tokens.length < 2) throw new Error(`Incorrect syntax in column '...${column}...'`)
    const lowerCaseColumn = column.toLowerCase()
    const defaultIx = tokens.findIndex(t => t.toLowerCase() === 'default')
    const defaultValue = tokens[defaultIx + 1];
    const hasDefault = defaultIx !== -1
    if (hasDefault && !defaultValue) throw new Error(`Incorrect syntax: no default value`)
    return {
        name: tokens[0].toLowerCase(),
        type: getType(tokens[1]),
        autoIncrement: lowerCaseColumn.includes('auto_increment'),
        notNull: lowerCaseColumn.includes('not null'),
        default: hasDefault ? convertOneValueToType(defaultValue).value : null
    }
}

export const createSchema = (columns: IColumn[]) => {
    return columns.reduce((acc, column) => {
        return {...acc, [column.name]: column}
    }, {} as ISchema)
}

const matchTableName = (query: string) => {
    const tableNameResults = query.match(/(?<=create table )\w+/gi)
    return tableNameResults ? tableNameResults[0] : null
}

const extractBody = (query: string) => {
    return query
        .replace(/create table \w+ \(/gi, '')
        .replace(/\);[\n\s]*/gi, '')
        .replace(/(\n+)/gi, '')
        .replace(/(\s{2,})/gi, '')
}