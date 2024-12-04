# CS-554-Final-Project

## Introduction and Setup
This is our team's final project for CS554.

In this repository, there are two folders. Start the webserver underneath Server, and make sure to have Redis running.
```
npm start
```
You will need a file in /Server/config/settings.js with the following:
```
  export const mongoConfig = {
    serverUrl: "SOME_MONGO_DB_DATABASE",
    database: "DB_NAME",
  };
```
These will be provided in the files for the graders when submitted.

For the Client, navigate to the Client folder and start the application.
```
npm run dev
```
You will need a file in /Client/src/settings.js with the following:
```
  export const auth0Config = {
    domain: "SOME_AUTH0_DOMAIN,
    clientId: "SOME_CLIENT_ID"
  };
```

The client is running React + Vite, with Apollo Client to communicate with the GraphQL backend. We also have Auth0 integration, however this is currently limited to only sign-ins with Google accounts. The action on Auth0's dashboard was causing issues with sending a createUser request to mongoDB that was not happening if we used non-database sign-in. Additionally, we don't have to store user's passwords in our database at all.

## Technical Specifications
### Backend
- Apollo Server (GraphQL), ran locally
- mongoDB Atlus, ran online through mongoDB on AmazonEC2's hosting (This will expire after the period of the class)
- redis, ran locally

### Frontend
- React + vite, ran locally
- Auth0, ran through Auth0's servers
- Apollo Client, ran locally

## IMPORTANT
Please remember to run the project **with** the mongoDB settings otherwise you will not be able to access the website properly. Auth0 stores the information in a database that's inaccessible without the credentials provided. Thank you. Same goes for the other settings file included.