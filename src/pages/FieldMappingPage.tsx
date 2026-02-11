import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type OnEdgesDelete,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import type { FieldMapping, SheetData } from '@/services/api';
import { Loader2, Search } from 'lucide-react';
import { SourceFieldNode, TargetFieldNode } from '@/components/field-mapping';
import { getTargetColumnsForEntity } from '@/constants/targetColumns';

const ROW_HEIGHT = 44;
const SOURCE_X = 0;
const TARGET_X = 420;
const NODE_TYPES = { sourceField: SourceFieldNode, targetField: TargetFieldNode };

const EMPTY_HEADERS: string[] = [];
const EMPTY_MAPPINGS: FieldMapping[] = [];

const SOURCE_PREFIX = 'source-';
const TARGET_PREFIX = 'target-';

/** Normalize for comparison: lowercase, strip spaces/underscores/hyphens (same name, camelCase, kebab-case, snake_case). */
function normalizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[\s_-]+/g, '')
    .replaceAll(/[^a-z0-9]/g, '');
}

function fieldNamesMatch(source: string, target: string): boolean {
  return normalizeFieldName(source) === normalizeFieldName(target);
}

/** Keep only mappings where source and target names match. */
function filterMappingsByName(mappings: FieldMapping[]): FieldMapping[] {
  return mappings.filter((m) => fieldNamesMatch(m.sourceField, m.targetField));
}

/** Build auto-mappings: only map when a target field name matches the source (by name). */
function buildNameBasedAutoMappings(
  headers: string[],
  targetFields: string[]
): FieldMapping[] {
  return headers.flatMap((header) => {
    const matched = targetFields.find((t) => fieldNamesMatch(header, t));
    return matched ? [{ sourceField: header, targetField: matched }] : [];
  });
}

function getTargetOptionsForEntity(entity: string): string[] {
  return getTargetColumnsForEntity(entity);
}

function buildNodesAndEdges(
  sourceFields: string[],
  targetFields: string[],
  mappings: FieldMapping[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  sourceFields.forEach((label, i) => {
    nodes.push({
      id: `${SOURCE_PREFIX}${label}`,
      type: 'sourceField',
      position: { x: SOURCE_X, y: i * ROW_HEIGHT },
      data: { label },
      draggable: false,
      selectable: false,
    });
  });
  targetFields.forEach((label, i) => {
    nodes.push({
      id: `${TARGET_PREFIX}${label}`,
      type: 'targetField',
      position: { x: TARGET_X, y: i * ROW_HEIGHT },
      data: { label },
      draggable: false,
      selectable: false,
    });
  });
  const edges: Edge[] = mappings
    .filter((m) => m.targetField !== 'Unmapped')
    .filter((m) => sourceFields.includes(m.sourceField) && targetFields.includes(m.targetField))
    .map((m) =>
      ({
        id: `e-${m.sourceField}-${m.targetField}`,
        source: `${SOURCE_PREFIX}${m.sourceField}`,
        target: `${TARGET_PREFIX}${m.targetField}`,
        type: 'default',
        pathOptions: { curvature: 0.5 },
        style: { stroke: 'rgb(234, 179, 8)', strokeWidth: 2.5 },
        deletable: true,
      }) as Edge
    );
  return { nodes, edges };
}

export function FieldMappingPage() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [entityMappings, setEntityMappings] = useState<{ [key: string]: FieldMapping[] }>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const navigate = useNavigate();

  const currentSheet = useMemo(() => sheets.find((s) => s.name === selectedEntity), [sheets, selectedEntity]);
  const sourceFieldsAll = useMemo(() => currentSheet?.headers ?? EMPTY_HEADERS, [currentSheet]);
  const targetFieldsAll = useMemo(() => getTargetOptionsForEntity(selectedEntity), [selectedEntity]);

  const sourceFields = useMemo(() => {
    if (!sourceSearch.trim()) return sourceFieldsAll;
    const q = sourceSearch.trim().toLowerCase();
    return sourceFieldsAll.filter((f) => f.toLowerCase().includes(q));
  }, [sourceFieldsAll, sourceSearch]);

  const targetFields = useMemo(() => {
    if (!targetSearch.trim()) return targetFieldsAll;
    const q = targetSearch.trim().toLowerCase();
    return targetFieldsAll.filter((f) => f.toLowerCase().includes(q));
  }, [targetFieldsAll, targetSearch]);

  const mappings = entityMappings[selectedEntity] ?? EMPTY_MAPPINGS;

  const initialNodesAndEdges = useMemo(
    () => buildNodesAndEdges(sourceFields, targetFields, mappings),
    [sourceFields, targetFields, mappings]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesAndEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesAndEdges.edges);

  useEffect(() => {
    setNodes(initialNodesAndEdges.nodes);
    setEdges(initialNodesAndEdges.edges);
  }, [initialNodesAndEdges, setNodes, setEdges]);

  useEffect(() => {
    const loadMappings = async () => {
      const sheetsStr = sessionStorage.getItem('sheets');
      if (!sheetsStr) {
        navigate('/upload');
        return;
      }
      const loadedSheets = JSON.parse(sheetsStr) as SheetData[];
      setSheets(loadedSheets);
      if (loadedSheets.length > 0 && !selectedEntity) setSelectedEntity(loadedSheets[0].name);

      const mappingsStr = sessionStorage.getItem('entityMappings');
      if (mappingsStr) {
        const parsed = JSON.parse(mappingsStr) as { [key: string]: FieldMapping[] };
        const filtered: { [key: string]: FieldMapping[] } = {};
        for (const [entity, maps] of Object.entries(parsed)) {
          filtered[entity] = filterMappingsByName(maps);
        }
        setEntityMappings(filtered);
      } else {
        const newEntityMappings: { [key: string]: FieldMapping[] } = {};
        for (const sheet of loadedSheets) {
          const targetFields = getTargetOptionsForEntity(sheet.name);
          newEntityMappings[sheet.name] = buildNameBasedAutoMappings(sheet.headers, targetFields);
        }
        setEntityMappings(newEntityMappings);
      }
      setLoading(false);
    };
    loadMappings();
  }, [navigate]);

  useEffect(() => {
    if (sheets.length > 0 && !selectedEntity) setSelectedEntity(sheets[0].name);
  }, [sheets, selectedEntity]);

  const handleEntityChange = (entity: string) => setSelectedEntity(entity);

  const onConnect: OnConnect = (connection: Connection) => {
    const sourceId = connection.source;
    const targetId = connection.target;
    if (!sourceId || !targetId) return;
    const sourceField = sourceId.startsWith(SOURCE_PREFIX) ? sourceId.slice(SOURCE_PREFIX.length) : null;
    const targetField = targetId.startsWith(TARGET_PREFIX) ? targetId.slice(TARGET_PREFIX.length) : null;
    if (!sourceField || !targetField) return;

    const updated: FieldMapping[] = mappings.filter((m) => m.sourceField !== sourceField).concat([
      { sourceField, targetField },
    ]);
    const next = { ...entityMappings, [selectedEntity]: updated };
    setEntityMappings(next);
    setEdges((eds) =>
      eds
        .filter((e) => e.source !== sourceId)
        .concat([
          {
            id: `e-${sourceField}-${targetField}`,
            source: sourceId,
            target: targetId,
            type: 'default',
            pathOptions: { curvature: 0.5 },
            style: { stroke: 'rgb(234, 179, 8)', strokeWidth: 2.5 },
            deletable: true,
          } as Edge,
        ])
    );
  };

  const onEdgesDelete: OnEdgesDelete = (deleted) => {
    const toRemove = new Set(deleted.map((e) => e.id));
    const updated = mappings.filter((m) => !toRemove.has(`e-${m.sourceField}-${m.targetField}`));
    setEntityMappings({ ...entityMappings, [selectedEntity]: updated });
  };

  const handleNext = async () => {
    setProcessing(true);
    const allRowsStr = sessionStorage.getItem('allRows');
    if (!allRowsStr) return;
    const allRows = JSON.parse(allRowsStr);
    const currentMappings = entityMappings[selectedEntity] ?? [];
    const result = await api.processMappedData(currentMappings, allRows);
    sessionStorage.setItem('mappedData', JSON.stringify(result.data));
    sessionStorage.setItem('mappings', JSON.stringify(entityMappings[selectedEntity]));
    sessionStorage.setItem('selectedEntity', selectedEntity);
    sessionStorage.setItem('entityMappings', JSON.stringify(entityMappings));
    sessionStorage.setItem('allEntityMappings', JSON.stringify(entityMappings));
    navigate('/data-preview');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading mappings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Field Mapping
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Map source fields to target entities by dragging from source to destination</p>
        </div>

        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 animate-in">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl">Map Your Fields</CardTitle>
                <CardDescription className="text-base mt-1">
                  Select an entity. Drag from a source field handle (right) to a destination field handle (left) to create a mapping. Select a line and press Delete to remove.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <label htmlFor="entity-mapping-select" className="text-sm font-semibold text-foreground mb-2 block">
                Select Entity
              </label>
              <select
                id="entity-mapping-select"
                value={selectedEntity}
                onChange={(e) => handleEntityChange(e.target.value)}
                className="flex-1 max-w-xs h-11 px-4 py-2 rounded-lg border-2 border-input bg-white dark:bg-gray-900 text-foreground hover:border-blue-500 dark:hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-medium shadow-sm"
              >
                {sheets.map((sheet) => (
                  <option key={sheet.name} value={sheet.name}>
                    {sheet.name} ({sheet.headers.length} fields)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <span id="source-search-label" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source – {selectedEntity}</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="source-search"
                    type="text"
                    placeholder="Search for field"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    aria-labelledby="source-search-label"
                    className="w-full h-9 pl-8 pr-3 rounded-md border border-input bg-background text-sm"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <span id="target-search-label" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Output / Target</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="target-search"
                    type="text"
                    placeholder="Search for field"
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    aria-labelledby="target-search-label"
                    className="w-full h-9 pl-8 pr-3 rounded-md border border-input bg-background text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 border-border overflow-hidden bg-muted/30" style={{ height: 500 }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgesDelete={onEdgesDelete}
                isValidConnection={() => true}
                nodeTypes={NODE_TYPES}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.3}
                maxZoom={1.5}
                nodesDraggable={false}
                nodesConnectable={true}
                elementsSelectable={true}
                edgesReconnectable={false}
                defaultEdgeOptions={{ type: 'default', pathOptions: { curvature: 0.5 }, deletable: true } as React.ComponentProps<typeof ReactFlow>['defaultEdgeOptions']}
                proOptions={{ hideAttribution: true }}
              >
                <Background gap={12} size={1} />
                <Controls showInteractive={false} />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Panel position="top-left" className="m-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  {mappings.filter((m) => m.targetField !== 'Unmapped').length} mappings
                </Panel>
              </ReactFlow>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => navigate('/upload')} className="w-full sm:w-auto order-2 sm:order-1">
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={processing}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 h-11 order-1 sm:order-2"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Next Step
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
