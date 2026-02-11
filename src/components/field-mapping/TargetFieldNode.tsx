import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

export type TargetFieldNodeData = { label: string };
export type TargetFieldNodeType = Node<TargetFieldNodeData, 'targetField'>;

function TargetFieldNodeComponent({ data }: NodeProps<TargetFieldNodeType>) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-[180px] px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-800 shadow-sm">
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !border-purple-500 !bg-white dark:!bg-gray-800" />
      <span className="text-sm font-medium text-purple-900 dark:text-purple-100 truncate">{data.label}</span>
    </div>
  );
}

export const TargetFieldNode = memo(TargetFieldNodeComponent);
