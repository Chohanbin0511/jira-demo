import { useMemo } from "react";
import { useIssues } from "@/_features/issues/hooks/use-issues";
import { Task } from "gantt-task-react";
import { useProjects } from "@/_features/projects/hooks/use-projects"; // Import useProjects

export function useTimeline(projectId?: string) {
  const {
    data: issues,
    isLoading: issuesLoading,
    error: issuesError,
  } = useIssues(projectId);
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects(); // Fetch all projects

  const isLoading = issuesLoading || projectsLoading;
  const error = issuesError || projectsError;

  const tasks: Task[] = useMemo(() => {
    if (!issues || !projects) return [];

    // Create a map for projectId to projectName
    const projectMap = new Map<string, string>();

    projects.forEach((p) => {
      projectMap.set(p.id, p.name);
    });

    return issues
      .filter((issue) => issue.startDate && issue.dueDate)
      .map((issue) => {
        let backgroundColor = "#e5e7eb";
        let progressColor = "#3b82f6";

        switch (issue.type) {
          case "BUG":
            backgroundColor = "#ffe4e6"; // red-100
            progressColor = "#e11d48"; // red-600
            break;
          case "EPIC":
            backgroundColor = "#f3e8ff"; // purple-100
            progressColor = "#9333ea"; // purple-600
            break;
          case "STORY":
            backgroundColor = "#dcfce7"; // green-100
            progressColor = "#16a34a"; // green-600
            break;
          case "TASK":
            backgroundColor = "#dbeafe"; // blue-100
            progressColor = "#2563eb"; // blue-600
            break;
        }

        const projectName =
          projectMap.get(issue.projectId) || `Project ${issue.projectId}`; // Get project name

        return {
          id: issue.id,
          type: "task",
          name: issue.title,
          start: new Date(issue.startDate!),
          end: new Date(issue.dueDate!),
          progress: issue.progress || 0,
          styles: {
            progressColor: progressColor,
            progressSelectedColor: progressColor,
            backgroundColor: backgroundColor,
            backgroundSelectedColor: backgroundColor,
          },
          project: projectName, // Assign project name here
        };
      });
  }, [issues, projects]); // Add projects to dependency array

  return { tasks, isLoading, error };
}
