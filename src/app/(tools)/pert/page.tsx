import { tasks } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

type Node = {
  id: string;
  title: string;
  x: number;
  y: number;
  dependencies: string[];
};

// Pre-calculate positions for a static layout
const nodes: Node[] = [
  { id: 'task-2', title: 'Setup Project', x: 5, y: 30, dependencies: [] },
  { id: 'task-1', title: 'Design Mockups', x: 5, y: 70, dependencies: [] },
  { id: 'task-5', title: 'Implement AI API', x: 25, y: 10, dependencies: ['task-2'] },
  { id: 'task-7', title: 'Setup Testing', x: 25, y: 50, dependencies: ['task-2'] },
  { id: 'task-3', title: 'Auth Flow', x: 45, y: 30, dependencies: ['task-1', 'task-2'] },
  { id: 'task-4', title: 'Kanban Component', x: 45, y: 70, dependencies: ['task-1'] },
  { id: 'task-6', title: 'Gantt Chart', x: 65, y: 70, dependencies: ['task-1'] },
  { id: 'task-8', title: 'Deploy', x: 85, y: 50, dependencies: ['task-3', 'task-4', 'task-5', 'task-6'] },
];

const NodeComponent = ({ node }: { node: Node }) => (
  <div
    className="absolute transform -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${node.x}%`, top: `${node.y}%` }}
  >
    <Card className="w-40 shadow-lg bg-card hover:shadow-xl transition-shadow">
      <div className="p-3 text-center">
        <p className="text-sm font-semibold truncate">{node.title}</p>
        <p className="text-xs text-muted-foreground">{node.id}</p>
      </div>
    </Card>
  </div>
);

const EdgeComponent = ({ from, to }: { from: Node; to: Node }) => {
  const isCritical = ['task-2','task-3', 'task-8'].includes(from.id) && ['task-3', 'task-8'].includes(to.id);
  const strokeColor = isCritical ? 'hsl(var(--accent))' : 'hsl(var(--border))';

  return (
    <line
      x1={`${from.x}%`}
      y1={`${from.y}%`}
      x2={`${to.x}%`}
      y2={`${to.y}%`}
      stroke={strokeColor}
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
    />
  );
};

export default function PertPage() {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">PERT Diagram</h1>
      <p className="text-muted-foreground mb-8">
        Visualize task dependencies and the critical path of your project.
      </p>
      <Card className="w-full h-[70vh] relative overflow-auto">
        <svg width="100%" height="100%" className="min-w-[800px] min-h-[500px]">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--border))" />
            </marker>
             <marker id="arrowhead-critical" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--accent))" />
            </marker>
          </defs>
          {nodes.map(node =>
            node.dependencies.map(depId => {
              const fromNode = nodeMap.get(depId);
              if (!fromNode) return null;
              const isCritical = ['task-2','task-3', 'task-8'].includes(fromNode.id) && ['task-3', 'task-8'].includes(node.id);
              return (
                 <line
                  key={`${depId}-${node.id}`}
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke={isCritical ? 'hsl(var(--accent))' : 'hsl(var(--border))'}
                  strokeWidth="2"
                  markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                />
              )
            })
          )}
        </svg>
        {nodes.map(node => (
          <NodeComponent key={node.id} node={node} />
        ))}
      </Card>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-accent"></div>
          <span>Critical Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-border"></div>
          <span>Dependency</span>
        </div>
      </div>
    </div>
  );
}
