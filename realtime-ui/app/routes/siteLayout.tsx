import { NavLink, Outlet, useParams, Link } from "react-router";

export default function SiteLayout() {
  const { siteId } = useParams();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-3xl mx-auto pt-10">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {siteId}
        </h1>
         <div className="mt-4 text-sm">
      </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-6 mb-8">
          <NavLink
            to={`/site/${siteId}`}
            end
            className={({ isActive }) =>
              isActive
                ? "px-4 py-2 border-b-2 border-blue-600 font-semibold text-blue-600"
                : "px-4 py-2 text-gray-500"
            }
          >
            Battery
          </NavLink>

          <NavLink
            to={`/site/${siteId}/solar`}
            className={({ isActive }) =>
              isActive
                ? "px-4 py-2 border-b-2 border-yellow-500 font-semibold text-yellow-500"
                : "px-4 py-2 text-gray-500"
            }
          >
            Solar
          </NavLink>
        </div>

        <Outlet />

        <div className="text-center mt-8">
          <Link to="/" className="text-gray-500 underline">
            Back to Sites
          </Link>
        </div>
      </div>
    </div>
  );
}
