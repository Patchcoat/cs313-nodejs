CREATE TABLE person
(
    id            INT PRIMARY KEY NOT NULL,
    first_name    CHAR(20),
    last_name     CHAR(20),
    date_of_birth DATE
);

CREATE TABLE parents
(
    parent      INT REFERENCES person(id),
    child       INT REFERENCES person(id),
    PRIMARY KEY (parent, child)
);
