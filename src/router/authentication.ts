import { login, register } from "../controllers/authentication";

export default (router: any) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
};
