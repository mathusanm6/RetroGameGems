-- Drop the schema if it exists
DROP SCHEMA IF EXISTS loyalty_card CASCADE;

-- Create the schema
CREATE SCHEMA IF NOT EXISTS loyalty_card;

-- Set the search path to the schema
set
    search_path to loyalty_card;

-- Create the tables
CREATE TABLE
    clients (
        id SERIAL PRIMARY KEY,
        last_name VARCHAR(100) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        points INTEGER DEFAULT 0,
        birth_date DATE NOT NULL
    );

CREATE TABLE
    gifts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        needed_points INTEGER NOT NULL
    );

CREATE TABLE
    transactions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients (id),
        gift_id INTEGER REFERENCES gifts (id),
        transaction_date DATE NOT NULL
    );

CREATE TABLE
    managers (
        id SERIAL PRIMARY KEY,
        last_name VARCHAR(100) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );