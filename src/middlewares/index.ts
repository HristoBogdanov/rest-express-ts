import express from "express";
import { get, merge } from "lodash";
import { getUserBySessionToken } from "../db/users";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["SESSION_TOKEN"];

    if (!sessionToken) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return res.status(403).send({ error: "Unauthorized" });
    }

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.error(error);
    res.status(401).send({ error: "Unauthorized" });
  }
};
