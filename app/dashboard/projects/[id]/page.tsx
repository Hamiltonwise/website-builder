import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/services/project.service';
import { getJobsByProject } from '@/lib/services/job.service';
import { getStatusLabel } from '@/lib/services/project-status.service';
import type { ProjectStatus } from '@prisma/client';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const params = await props.params;
  const { id } = params;

  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const jobs = await getJobsByProject(project.id);

  // Define the workflow steps
  const workflowSteps: { status: ProjectStatus; label: string }[] = [
    { status: 'CREATED', label: 'Project Created' },
    { status: 'GBP_SELECTED', label: 'Business Profile' },
    { status: 'GBP_SCRAPED', label: 'Profile Data' },
    { status: 'IMAGES_ANALYZED', label: 'Images' },
    { status: 'WEBSITE_SCRAPED', label: 'Website Content' },
    { status: 'HTML_GENERATED', label: 'Site Generated' },
    { status: 'READY', label: 'Ready' },
  ];

  const currentStepIndex = workflowSteps.findIndex(
    (step) => step.status === project.status
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/projects"
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold mb-2">{project.generatedHostname}</h1>
          <p className="text-gray-600">{getStatusLabel(project.status)}</p>
        </div>

        {/* Status Stepper */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Progress</h2>

          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200" />
            <div
              className="absolute left-6 top-6 w-0.5 bg-blue-600 transition-all"
              style={{
                height: `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="relative space-y-6">
              {workflowSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <div key={step.status} className="flex items-start">
                    {/* Circle indicator */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                        isCompleted
                          ? 'bg-blue-600 border-blue-600'
                          : isCurrent
                            ? 'bg-white border-blue-600'
                            : 'bg-white border-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isCurrent ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="ml-4 pt-2">
                      <p
                        className={`font-medium ${
                          isCompleted || isCurrent
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-blue-600 mt-1">Current step</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Jobs</h2>

          {jobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No jobs yet</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{job.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : job.status === 'running'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Link */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <a
            href={`http://${project.generatedHostname}:7777`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {project.generatedHostname}:7777 →
          </a>
        </div>
      </div>
    </div>
  );
}
