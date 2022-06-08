export const createQuery = `
    CREATE TABLE Persons (
    PersonID int NOT NULL AUTO_INCREMENT,
    FirstName varchar(255) NOT NULL,
    LastName varchar(255) NOT NULL,
    Age int,
    Address varchar(255),
    City varchar(255) DEFAULT 'Kyiv'
);`