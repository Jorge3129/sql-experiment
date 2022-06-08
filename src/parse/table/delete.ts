import {database} from "../../db/database";
import {execCreateQuery} from "../database/create";
import {createQuery} from "../../queries/create";
import {IFilter} from "../../models/filter";
import {convertOneValueToType, execInsertQuery} from "./insert";
import {execQuery} from "../exec";
import {insertQuery, insertQuery2} from "../../queries/insert";
import {deleteQuery} from "../../queries/delete";

const selectQuery = `
SELECT LastName, FirstName, Age 
FROM Persons 
WHERE PersonID = 1
 //AND LastName LIKE 'C%' OR FirstName = 'Tom'
ORDER BY Age
`

export const execDeleteQuery = (query: string) => {
    // console.log('SELECT')
    try {
        const tableName = matchTableName(query)
        if (!tableName) throw new Error(`Incorrect syntax: no table name provided`)
        const table = database.tables.find(t => t.name === tableName.toLowerCase())
        if (!table) throw new Error(`Table ${tableName} does not exist`)
        const filters = extractFilterNames(query)
        table.rows = table.rows.filter(row => !matchRow(row, filters))
        return table.rows
    } catch (e) {
        console.log(e)
    }
}

const matchRow = (row: Object, filters: IFilter[]) => {
    if (!filters.length) return true;
    const {name, value, func} = filters[0]
    return func(row[name], value)
}

const extractFilterNames = (query: string): IFilter[] => {
    const match = query.match(/WHERE.*/gi)
    if (!match) return []
    const newMatch = match[0].replace(';', '')
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
// for (let i = 0; i < 2; i++) {
//     execInsertQuery(insertQuery)
// }
// execInsertQuery(insertQuery2)
// console.log(execDeleteQuery(deleteQuery))