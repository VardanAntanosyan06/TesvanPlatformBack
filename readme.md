## Tesvan Platform Back README

### Pre-requisites
- Node.js 18
- PostgreSQL

### Installation
1. Clone this repository to your local machine.
    ```
    git clone https://github.com/VardanAntanosyan06/TesvanPlatformBack.git
    ``` 
2. Navigate into the project directory.
    ```
    cd TesvanPlatformBack
    ```
3. Install dependencies.
    ```
    npm install
    ```
4. Create a PostgreSQL database manually with the name TesvanPlatformBack.
5. Run database migration scripts.
    ```
    npx sequelize-cli db:migrate
    ```
6. Seed the database with initial data.
    ```
    npx sequelize-cli db:seed:all
    ```

### Usage
To start the server, run:
```
npm run start
```