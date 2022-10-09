import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./api/resolvers/post";
import { UserResolver } from "./api/resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const em = orm.em.fork();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: em }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });

  function updateClickCount() {
    let clicks = 0;
    return function () {
      clicks++;
      console.log(clicks);
    };
  }
  let click = updateClickCount();
  click(); // 1
  click(); // 2

  const updateClickArrow = (() => {
    let qtd = 0;
    const addQtd = () => {
      qtd++;
    };
    const getQtd = () => {
      return console.log("qtd: ", qtd);
    };
    return { addQtd, getQtd };
  })();

  updateClickArrow.addQtd();
  updateClickArrow.getQtd(); // 1
  updateClickArrow.addQtd();
  updateClickArrow.getQtd(); // 2
};

main().catch((err) => console.error(err));
