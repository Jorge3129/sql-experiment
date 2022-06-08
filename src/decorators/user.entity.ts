import {Column, Dao, Entity, Query} from "./decorators";
import {database} from "../db/database";
import {execQuery} from "../parse/exec";

@Entity('user')
class User {
    @Column({autoIncrement: true})
    id: number

    @Column()
    name: string

    @Column()
    city: string

    @Column({default: null})
    address: string

    @Column({default: 10})
    age: number
}

const user = new User()

@Dao('user')
class UserDao {
    @Query(`select * from user where id = :id`)
    getUser(id: number) {
        return (results) => results[0]
    }

    @Query(`insert into user (name, city, address, age) values (:name, :city, :address, :age)`)
    insertUser(
        name: string,
        city: string,
        address: string,
        age: number,
    ) {
    }
}


console.log(database.tables[0])
const userDao = new UserDao()
execQuery(`insert into user (name) values ('JOJO');`)
execQuery(`insert into user (name) values ('PAUL');`)
execQuery(`insert into user (name) values ('GEORGE');`)
execQuery(`delete from user where name = 'PAUL';`)
console.log(userDao.getUser(1))
console.log(userDao.insertUser('Jean', 'Paris', 'Rue de Smth', 40))
// console.log(database.tables[0].rows)
