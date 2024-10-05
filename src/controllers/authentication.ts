import express from "express";
import { createUser, getUserByEmail } from "../db/users";
import { authentication, random } from "../helpers";
import { sessionTokenAge } from "../lib/constants";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }

    //Adding the salt and password fields, because we excluded them from selection in the schema
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );
    if (!user) {
      return res.sendStatus(404);
    }

    const expectedHash = authentication(user.authentication.salt, password);
    //wrong password
    if (user.authentication.password !== expectedHash) {
      return res.sendStatus(403);
    }

    //generating the session token
    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("SESSION_TOKEN", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/", //valid for all paths
      httpOnly: true, //cannot be accessed by JavaScript, XSS protection
      secure: false, //in production, set to true for HTTPS
      sameSite: "strict", //protects against CSRF
      maxAge: sessionTokenAge, //how long the cookies is valid
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    //TODO: add validation for email, password, and username
    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.sendStatus(409);
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(201).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
