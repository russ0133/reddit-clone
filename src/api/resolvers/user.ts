import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2";

// InputType are types for the inputs
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// ObjectType are types for what is returned on mutations
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user)
      return {
        errors: [{ field: "username", message: "that username doesn't exist" }],
      };

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) return { errors: [{ field: "password", message: "incorrect password" }] };

    req.session.userId = user.id;

    req.session.save();

    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    console.log("tried register");
    if (options.username.length <= 2)
      return {
        errors: [
          {
            field: "username",
            message: "username length must be longer than 2",
          },
        ],
      };

    if (options.password.length <= 3)
      return {
        errors: [
          {
            field: "password",
            message: "password length must be longer than 3",
          },
        ],
      };

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505")
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
    }

    console.log("Tried registering: ", options);

    return { user };
  }
}
