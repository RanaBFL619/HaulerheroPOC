import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

export type SourceFieldNodeData = { label: string };
export type SourceFieldNodeType = Node<SourceFieldNodeData, 'sourceField'>;

function SourceFieldNodeComponent({ data }: NodeProps<SourceFieldNodeType>) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-[180px] px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 shadow-sm">
      <span className="text-sm font-medium text-foreground truncate">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !border-primary !bg-background" />
    </div>
  );
}

export const SourceFieldNode = memo(SourceFieldNodeComponent);
