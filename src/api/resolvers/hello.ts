import { Resolver, Query, Ctx } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class HelloResolver {
  @Query(() => String)
  sss(@Ctx() { req }: MyContext): String {
    return "hello";
  }
}
