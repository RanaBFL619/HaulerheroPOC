import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

export type TargetFieldNodeData = { label: string };
export type TargetFieldNodeType = Node<TargetFieldNodeData, 'targetField'>;

function TargetFieldNodeComponent({ data }: NodeProps<TargetFieldNodeType>) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-[180px] px-3 py-2 rounded-lg bg-muted border border-border shadow-sm">
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !border-primary !bg-background" />
      <span className="text-sm font-medium text-foreground truncate">{data.label}</span>
    </div>
  );
}

export const TargetFieldNode = memo(TargetFieldNodeComponent);
