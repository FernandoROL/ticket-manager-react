# Support ticket manager

Support ticket manager react app with firebase auth and firestorm

## Features

- User authentication with firebase auth
- User profile page with custom avatar image support 
- Client register page 
- Ticket creation page 
- Ticket dashboard with list function for all tickets with edit and view functions for each item

## Installation

### Requirements

- Node
- Vite
- Firebase (with storage access)

### Setup

1. Clone the repository and make an env file 

    ```bash
    git clone https://github.com/FernandoROL/ticket-manager-react.git
    cd ticket-manager-react
    cp .env.example .env
    ```

2. Make a firebase project and fill up the env fields with the project's configuration

3. Install all dependecies with npm

    ```bash
    npm install
    ```

4. Run the app with

    ```bash
    npm run dev
    ```