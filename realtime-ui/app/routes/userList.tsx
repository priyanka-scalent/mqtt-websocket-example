import { Link } from "react-router";

const users = ["user-1", "user-2", "user-3"];

export default function UserList() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Select User</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <Link
            key={user}
            to={`/home/${user}`}
            className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
          >
            {user}
          </Link>
        ))}
      </div>
    </div>
  );
}
