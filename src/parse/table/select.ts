import {database} from "../../db/database";
import {execCreateQuery} from "../database/create";
import {createQuery} from "../../queries/create";
import {IFilter} from "../../models/filter";
import {convertOneValueToType, execInsertQuery} from "./insert";
import {execQuery} from "../exec";
import {insertQuery} from "../../queries/insert";

const selectQuery = `
SELECT LastName, FirstName, Age 
FROM Persons 
WHERE PersonID = 1
 //AND LastName LIKE 'C%' OR FirstName = 'Tom'
ORDER BY Age
`

export const execSelectQuery = (query: string) => {
    // console.log('SELECT')
    try {
        const tableName = matchTableName(query)
        if (!tableName) throw new Error(`Incorrect syntax: no table name provided`)
        const table = database.tables.find(t => t.name === tableName.toLowerCase())
        if (!table) throw new Error(`Table ${tableName} does not exist`)
        let columnNames = extractColumnNames(query)
        //if (columnNames[0] === "*") columnNames = Object.keys(table.schema)
        const filters = extractFilterNames(query)
        const filtered = table.rows.filter(row => matchRow(row, filters))
        // console.log(columnNames)
        return (!columnNames || columnNames[0] === "*")
            ? filtered
            : projectColumns(filtered, columnNames)
    } catch (e) {
        console.log(e)
    }
}

const projectColumns = (results: Object[], columnNames: string[]) => {
    return results.map(row => {
        return Object.keys(row)
            .filter(key => columnNames.includes(key))
            .reduce((acc, key) => ({...acc, [key]: row[key]}), {} as Object)
    })
}

const matchRow = (row: Object, filters: IFilter[]) => {
    if (!filters.length) return true;
    const {name, value, func} = filters[0]
    console.log(func(row[name], value))
    return func(row[name], value)
}

const extractColumnNames = (query: string): string[] => {
    return query
        .replace(/select/gi, '')
        .replace(/from.*/gi, '')
        .replace(/(\n+)/gi, '')
        .replace(/(\s{2,})/gi, '')
        .split(", ")
        .map(name => name.toLowerCase().replace(/\s*/gi, ''))
}

const extractFilterNames = (query: string): IFilter[] => {
    const match = query.match(/WHERE.*/gi)
    if (!match) return []
    const newMatch = match[0].replace(';', '')
        .replace(/order by.*/gi, '')
        .replace(/where\s+/gi, '')
        .replace(/\n+/gi, '')
        .replace(/(\s{2,})/gi, '')

    const filtersStrings = newMatch.split(/and|or/gi)
    const filters = filtersStrings
        .map(f => f.split(/ /g))
        .map(f => ({
            name: f[0].toLowerCase(),
            value: convertOneValueToType(f[2]).value,
            func: filterFunctions[f[1]]
        }))
    return filters
}

export const filterFunctions = {
    '=': (a, b) => a === b,
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
}

const matchTableName = (query: string) => {
    const tableNameResults = query.match(/(?<=from )\w+/gi)
    return tableNameResults ? tableNameResults[0] : null
}

// console.log(extractColumnNames(selectQuery))
// execCreateQuery(createQuery)
// for (let i = 0; i < 3; i++) {
//     execInsertQuery(insertQuery)
// }
// console.log(execSelectQuery(selectQuery))