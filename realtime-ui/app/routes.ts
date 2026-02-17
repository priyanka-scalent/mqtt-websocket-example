import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/userList.tsx"),
  route("home/:userId", "routes/home.tsx"),
] satisfies RouteConfig;
