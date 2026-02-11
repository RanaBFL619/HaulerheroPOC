import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

export type SourceFieldNodeData = { label: string };
export type SourceFieldNodeType = Node<SourceFieldNodeData, 'sourceField'>;

function SourceFieldNodeComponent({ data }: NodeProps<SourceFieldNodeType>) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-[180px] px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
      <span className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !border-blue-500 !bg-white dark:!bg-gray-800" />
    </div>
  );
}

export const SourceFieldNode = memo(SourceFieldNodeComponent);
