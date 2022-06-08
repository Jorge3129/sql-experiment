import 'reflect-metadata'
import {ColumnType} from "../models/table";
import {database} from "../db/database";
import {createSchema} from "../parse/database/create";
import {execQuery} from "../parse/exec";
import {formatValue} from "../models/getType";

export interface Options {
    notNull?: boolean
    default?: any
    autoIncrement?: boolean
    primaryKey?: boolean
}

let columns = []
let daos = []
console.log()

export function Column(options?: Options) {
    return function (target: any, key: string) {
        const t = Reflect.getMetadata("design:type", target, key);
        const column = Object.assign({
            name: key,
            type: t.name === "String" ? ColumnType.string : ColumnType.number
        }, options)
        columns.push(column)
    }
}

export function Entity(name: string) {
    return (target: any) => {
        database.tables.push({
            name,
            rows: [],
            schema: createSchema(columns)
        })
        columns = []
    }
}

export interface DaoOptions {
    table: string
}

export function Query(statement: string) {
    return function (
        target: Object,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const newStatement = statement + ' ;'
        const childFunction = descriptor.value;
        descriptor.value = (...args: any[]) => {
            console.log(newStatement.split(/:\w+(?=[\s),])/gi))
            const query = newStatement.split(/:\w+(?=[\s),])/gi)
                .reduce((acc, str, i, {length}) => {
                    if (i === 0) return acc + str;
                    return acc + formatValue(args[i - 1]) + str
                }, "")
            console.log(query)
            const results = execQuery(query)
            if (!childFunction()) return results
            return childFunction()(results)
        };
        return descriptor;
    };
}

export function Dao(table: string) {
    return function (target: any) {

    };
}