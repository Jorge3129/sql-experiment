import {execCreateQuery} from "./database/create";
import {execInsertQuery} from "./table/insert";
import {execSelectQuery} from "./table/select";
import {database} from "../db/database";
import {execDeleteQuery} from "./table/delete";

export const execQuery = (query: string) => {
    const lowerCaseQuery = query.toLowerCase()
    try {
        if (lowerCaseQuery.includes('create table'))
            return execCreateQuery(query)
        else if (lowerCaseQuery.includes('insert into'))
            return execInsertQuery(query)
        else if (lowerCaseQuery.includes('select'))
            return execSelectQuery(query)
        else if (lowerCaseQuery.includes('delete'))
            return execDeleteQuery(query)
        else if (lowerCaseQuery === "show")
            return database
        else return 'Something went wrong((('
    } catch (e) {
        console.log(e)
    }
}