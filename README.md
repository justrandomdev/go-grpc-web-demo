# grpc-web poc

This repo is an Angular web frontend that communicates with a grpc golang service on the backend. Its a very small and simple POC so don't expect miracles.

This POC is based on [gRPC-Web](https://github.com/grpc/grpc-web)

## Getting Started

### Server
* The server is in the the server folder
* Install golang dependecies
* Fire up the golang server in the server folder using your favourite method.

### Client
* Make sure you have a sane recent node environment
* Open the client doler on the command line & type `npm install`, followed by `npm start`

Don't worry about the envoy folder. It's an example envoy config that could be adapted for a prod environment
