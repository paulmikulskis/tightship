import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { applyMiddleware } from 'graphql-middleware';
import express from 'express';
import http from 'http';
import fs from 'fs';
import { config } from 'tightship-config';
import permissions from './permissions.js';
import resolvers from './resolvers.js';
import { typeDefs } from './schemastring.js';
import { makeExecutableSchema } from '@graphql-tools/schema';


async function listen(port) {

  const app = express();
  const httpServer = http.createServer(app);
  var schema = makeExecutableSchema({ typeDefs, resolvers });
  schema = applyMiddleware(schema, permissions)

  // construct the Apollo server
  const server = new ApolloServer({
    schema,
    middlewares: [permissions],
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      //const user = await firebaseAdmin.getUser(token)
      const user = {
        email: 'sungbean@yungsten.com',
        uid: 'testUid_420',
        displayName: 'Yungsten Sung'
      };
      return { token, user };
    },
  });

  // start things up
  await server.start();
  server.applyMiddleware({ app });
  return new Promise((resolve, reject) => {
    httpServer.listen(port).once('listening', resolve).once('error', reject)
  });

};

async function main() {
  try {
    await listen(4000)
    console.log('🚀 Server is ready at http://localhost:4000/graphql')
  } catch (err) {
    console.error('💀 Error starting the node server', err)
  };
};

void main();
