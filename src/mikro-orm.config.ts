import { __prod__ } from "./constants";
import { Post } from "./api/entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./api/entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
  },
  entities: [Post, User],
  dbName: "reddit",
  user: "postgres",
  password: "password",
  type: "postgresql",
  debug: false,
} as Parameters<typeof MikroORM.init>[0];
