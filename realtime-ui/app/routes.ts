import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/siteList.tsx"),
  route("site/:siteId", "routes/siteLayout.tsx", [
    index("routes/battery.tsx"),
    route("solar", "routes/solar.tsx"),
  ]),
] satisfies RouteConfig;
