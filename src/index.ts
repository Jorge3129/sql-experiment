import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import {execQuery} from "./parse/exec";
import {createQuery} from "./queries/create";
import {execInsertQuery} from "./parse/table/insert";
import {insertQuery, insertQuery2} from "./queries/insert";
import {execCreateQuery} from "./parse/database/create";
import {database} from "./db/database";

const rl = readline.createInterface({ input, output , prompt: 'mysql> '});

execCreateQuery(createQuery)
for (let i = 0; i < 2; i++) {
    execInsertQuery(insertQuery)
}
execInsertQuery(insertQuery2)
console.log(database.tables[0])
// rl.prompt();
//
// rl.on('line', (line) => {
//     console.log(execQuery(line.trim()))
//     rl.prompt();
// }).on('close', () => {
//     console.log('Have a great day!');
//     process.exit(0);
// });