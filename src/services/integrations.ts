import type { Deployment, IntegrationProvider } from "@/types";

export interface DeploymentProvider {
  id: string;
  name: string;
  list(projectId?: string): Promise<Deployment[]>;
  openLogs(deployment: Deployment): string | null;
}

export const INTEGRATION_CATALOG: IntegrationProvider[] = [
  { id: "github", name: "GitHub", connected: false, description: "Pull requests, issues, and Actions." },
  { id: "vercel", name: "Vercel", connected: false, description: "Production and preview deployments." },
  { id: "actions", name: "GitHub Actions", connected: false, description: "Workflow runs and CI status." },
  { id: "railway", name: "Railway", connected: false, description: "Service deploys and logs." },
  { id: "render", name: "Render", connected: false, description: "Web services and background jobs." },
  { id: "cloudflare", name: "Cloudflare", connected: false, description: "Pages and Workers." },
  { id: "docker", name: "Docker", connected: true, description: "Local engine and Compose projects." },
];

export function createStaticDeploymentProvider(
  id: string,
  name: string,
  rows: Deployment[],
): DeploymentProvider {
  return {
    id,
    name,
    async list(projectId) {
      return rows.filter((row) => !projectId || row.projectId === projectId);
    },
    openLogs(deployment) {
      return deployment.logUrl;
    },
  };
}
