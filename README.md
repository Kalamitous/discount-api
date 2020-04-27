# discount-api

A REST API in Go for a discount system and a barebones React storefront to accompany it.

## Prerequisites

You will need to have [Node.js](https://nodejs.org/en/) and [Go](https://golang.org/) installed.

## Building

To build the backend, run the following command in the `backend` folder.
```sh
go build
```

To build the frontend, run the following command in the `frontend` folder. This may take a while.
```sh
npm install
```

## Running

Start the Go server by running the following command in the `backend` folder.
```sh
go run main.go
```

In a separate terminal, start the React app by running the following command in the `frontend` folder.
```sh
npm start
```
