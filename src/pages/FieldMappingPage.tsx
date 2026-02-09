import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import type { FieldMapping, SheetData } from '@/services/api';
import { Loader2, GripVertical } from 'lucide-react';

interface SortableItemProps {
  id: string;
  sourceField: string;
  targetField: string;
  onTargetChange: (newTarget: string) => void;
  targetOptions: string[];
}

function SortableItem({ id, sourceField, targetField, onTargetChange, targetOptions }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 rounded-xl hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
        <GripVertical className="h-6 w-6 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source Field</div>
          <div className="text-base font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-3 py-2 rounded-lg">{sourceField}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Target Field</div>
          <select
            value={targetField}
            onChange={(e) => onTargetChange(e.target.value)}
            className="w-full h-11 px-3 py-2 text-base rounded-lg border-2 border-input bg-background hover:border-purple-400 dark:hover:border-purple-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-medium"
          >
            {targetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function FieldMappingPage() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('Account');
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [entityMappings, setEntityMappings] = useState<{ [key: string]: FieldMapping[] }>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const getTargetOptionsForEntity = (entity: string): string[] => {
    const options: { [key: string]: string[] } = {
      'Account': ['Account Name', 'Industry', 'Annual Revenue', 'Website', 'Phone', 'Country', 'Unmapped'],
      'Contact': ['First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Department', 'Account', 'Unmapped'],
      'Opportunity': ['Opportunity Name', 'Amount', 'Stage', 'Close Date', 'Probability', 'Account', 'Owner', 'Unmapped']
    };
    return options[entity] || [];
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadMappings = async () => {
      const sheetsStr = sessionStorage.getItem('sheets');
      if (!sheetsStr) {
        navigate('/upload');
        return;
      }

      const loadedSheets = JSON.parse(sheetsStr) as SheetData[];
      setSheets(loadedSheets);

      // Load or initialize mappings for all entities
      const mappingsStr = sessionStorage.getItem('entityMappings');
      if (mappingsStr) {
        setEntityMappings(JSON.parse(mappingsStr));
      } else {
        // Auto-map for all entities
        const newEntityMappings: { [key: string]: FieldMapping[] } = {};
        for (const sheet of loadedSheets) {
          const autoMappings = await api.autoMapFields(sheet.headers, sheet.name);
          newEntityMappings[sheet.name] = autoMappings;
        }
        setEntityMappings(newEntityMappings);
      }

      setLoading(false);
    };

    loadMappings();
  }, [navigate]);

  useEffect(() => {
    if (entityMappings[selectedEntity]) {
      setMappings(entityMappings[selectedEntity]);
    }
  }, [selectedEntity, entityMappings]);

  const handleEntityChange = (entity: string) => {
    setSelectedEntity(entity);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newMappings = [...mappings];
      const oldIndex = newMappings.findIndex((item) => item.sourceField === active.id);
      const newIndex = newMappings.findIndex((item) => item.sourceField === over.id);
      const reordered = arrayMove(newMappings, oldIndex, newIndex);

      setMappings(reordered);

      // Update entity mappings
      const updated = { ...entityMappings };
      updated[selectedEntity] = reordered;
      setEntityMappings(updated);
    }
  };

  const handleTargetChange = (sourceField: string, newTarget: string) => {
    const updated = mappings.map((mapping) =>
      mapping.sourceField === sourceField
        ? { ...mapping, targetField: newTarget }
        : mapping
    );

    setMappings(updated);

    // Update entity mappings
    const entityUpdated = { ...entityMappings };
    entityUpdated[selectedEntity] = updated;
    setEntityMappings(entityUpdated);
  };

  const handleNext = async () => {
    setProcessing(true);

    const allRowsStr = sessionStorage.getItem('allRows');
    if (!allRowsStr) return;

    const allRows = JSON.parse(allRowsStr);

    // Process data for the selected entity
    const result = await api.processMappedData(entityMappings[selectedEntity], allRows);

    sessionStorage.setItem('mappedData', JSON.stringify(result.data));
    sessionStorage.setItem('mappings', JSON.stringify(entityMappings[selectedEntity]));
    sessionStorage.setItem('selectedEntity', selectedEntity);
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
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Field Mapping</h1>
          <p className="text-sm text-muted-foreground mt-1">Map source fields to target entities</p>
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
                  Select an entity and review field mappings. Drag to reorder or change target fields.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Entity Selection */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <label htmlFor="entity-mapping-select" className="text-sm font-semibold text-foreground mb-2 block">Select Entity</label>
              <div className="flex items-center gap-3">
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
            </div>

            {/* Field Mapping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Field Mappings for {selectedEntity}</h3>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {mappings.length} fields
                </span>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={mappings.map((m) => m.sourceField)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {mappings.map((mapping) => (
                      <SortableItem
                        key={mapping.sourceField}
                        id={mapping.sourceField}
                        sourceField={mapping.sourceField}
                        targetField={mapping.targetField}
                        targetOptions={getTargetOptionsForEntity(selectedEntity)}
                        onTargetChange={(newTarget) =>
                          handleTargetChange(mapping.sourceField, newTarget)
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/upload')}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
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