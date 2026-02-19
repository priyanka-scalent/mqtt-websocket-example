import { Link } from "react-router";

const sites = ["site-1", "site-2", "site-3"];

export default function SiteList() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Select Site</h1>

      <div className="space-y-4">
        {sites.map((site) => (
          <Link
            key={site}
            to={`/site/${site}`}
            className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
          >
            {site}
          </Link>
        ))}
      </div>
    </div>
  );
}
