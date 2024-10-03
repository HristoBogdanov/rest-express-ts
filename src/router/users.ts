import { getAllUsers } from "../controllers/users";

export default (router: any) => {
  router.get("/users", getAllUsers);
};
