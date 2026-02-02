import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard/projects"
                className="text-blue-600 hover:underline"
              >
                View All Projects
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
