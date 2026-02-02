"use client";

import { useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Card } from "@/_features/common/components/ui/card";
import { TimelineFilterBar } from "./TimelineFilterBar";

interface TimelineViewProps {
  tasks: Task[];
}

export function TimelineView({ tasks: initialTasks }: TimelineViewProps) {
  const [view, setView] = useState<ViewMode>(ViewMode.Month);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tasks based on search query
  const filteredTasks = initialTasks.filter((task) =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gantt chart configurations
  const columnWidth =
    view === ViewMode.Month ? 300 : view === ViewMode.Week ? 250 : 65;
  const headerHeight = 50;

  if (initialTasks.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-semibold">No timeline data</p>
          <p className="text-sm">
            Assign start and due dates to your issues to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <TimelineFilterBar
        viewMode={view}
        onViewModeChange={setView}
        onSearch={setSearchQuery}
      />

      <Card className="w-full flex-1 overflow-hidden border shadow-sm flex flex-col py-0">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Header + Task List */}
          <div className="w-[300px] flex-shrink-0 flex flex-col border-r bg-white">
            {/* Header Row - Aligned with Gantt Header */}
            <div
              className="flex items-center border-b bg-slate-50 px-4 text-xs font-semibold text-slate-500 uppercase"
              style={{ height: headerHeight }}
            >
              업무
            </div>

            {/* Custom Task List */}
            <div
              className="flex-1 overflow-y-hidden" // Hidden to rely on main scroll or external sync
              id="custom-task-list"
            >
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center px-4 border-b hover:bg-slate-50 transition-colors"
                  style={{ height: "50px" }} // Matching Gantt rowHeight
                >
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {task.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate uppercase">
                      {task.project}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Gantt Chart */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div className="min-w-[800px]">
              <Gantt
                tasks={filteredTasks}
                viewMode={view}
                columnWidth={columnWidth}
                listCellWidth="" // Hiding default list
                barBackgroundColor="#e5e7eb"
                barProgressColor="#3b82f6"
                fontSize="12px"
                rowHeight={50}
                headerHeight={headerHeight}
                fontFamily="inherit"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
