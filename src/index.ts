import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  //const emFork = orm.em.fork();

  const app = express();

  const apolloServer = new ApolloServer({ schema: await buildSchema({ resolvers: [HelloResolver], validate: false }) });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.get("/", (_, res) => {
    res.send("hello");
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

console.log("hello there");
main().catch((err) => console.error(err));
