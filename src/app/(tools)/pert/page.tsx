import { Card } from '@/components/ui/card';

type Node = {
  id: string;
  title: string;
  x: number;
  y: number;
  dependencies: string[];
};

// Pre-calculate positions for a static layout
const nodes: Node[] = [
  { id: 'act-1.1.1', title: 'Riset Pasar', x: 5, y: 50, dependencies: [] },
  { id: 'act-1.1.2', title: 'Desain Arsitektur', x: 25, y: 50, dependencies: ['act-1.1.1'] },
  { id: 'milestone-1.1.3', title: 'Persetujuan Desain', x: 40, y: 50, dependencies: ['act-1.1.2'] },
  { id: 'act-1.2.1', title: 'Setup Lingkungan Dev', x: 55, y: 30, dependencies: ['milestone-1.1.3'] },
  { id: 'act-1.2.3', title: 'Implementasi DB', x: 70, y: 15, dependencies: ['act-1.2.1'] },
  { id: 'act-1.2.2', title: 'Pengembangan API', x: 70, y: 45, dependencies: ['act-1.2.1'] },
  { id: 'act-1.3.1', title: 'Pengembangan UI/UX', x: 85, y: 45, dependencies: ['act-1.2.2'] },
  { id: 'act-1.3.2', title: 'Pengujian Integrasi', x: 85, y: 65, dependencies: ['act-1.3.1'] },
  { id: 'act-1.3.3', title: 'UAT', x: 95, y: 50, dependencies: ['act-1.3.2', 'act-1.2.3'] },
];

const NodeComponent = ({ node }: { node: Node }) => (
  <div
    className="absolute transform -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${node.x}%`, top: `${node.y}%` }}
  >
    <Card className="w-36 shadow-lg bg-card hover:shadow-xl transition-shadow">
      <div className="p-3 text-center">
        <p className="text-sm font-semibold truncate">{node.title}</p>
        <p className="text-xs text-muted-foreground">{node.id}</p>
      </div>
    </Card>
  </div>
);

export default function PertPage() {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Manually define the critical path for visualization
  const criticalPathEdges = new Set([
    'act-1.1.1-act-1.1.2',
    'act-1.1.2-milestone-1.1.3',
    'milestone-1.1.3-act-1.2.1',
    'act-1.2.1-act-1.2.2',
    'act-1.2.2-act-1.3.1',
    'act-1.3.1-act-1.3.2',
    'act-1.3.2-act-1.3.3',
  ]);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">PERT Diagram</h1>
      <p className="text-muted-foreground mb-8">
        Visualize task dependencies and the critical path of your project.
      </p>
      <Card className="w-full h-[70vh] relative overflow-auto">
        <svg width="100%" height="100%" className="min-w-[1200px] min-h-[500px]">
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
              const edgeId = `${depId}-${node.id}`;
              const isCritical = criticalPathEdges.has(edgeId);
              
              return (
                 <line
                  key={edgeId}
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
