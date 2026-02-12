import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/services/api';
import { Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import type { FieldMapping } from '@/services/api';
import { PAGE_OUTER, PAGE_CONTAINER } from '@/constants/layout';

const ENTITIES = ['Account', 'Contact', 'Opportunity'];

export function DataPreviewPage() {
  const [allEntityData, setAllEntityData] = useState<{ [key: string]: any[] }>({});
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('Account');
  const [allEntityMappings, setAllEntityMappings] = useState<{ [key: string]: FieldMapping[] }>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checkedRows, setCheckedRows] = useState<{ [key: string]: Set<number> }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const allRowsStr = sessionStorage.getItem('allRows');
      const entityStr = sessionStorage.getItem('selectedEntity');
      const allMappingsStr = sessionStorage.getItem('allEntityMappings');

      if (!allRowsStr) {
        navigate('/upload');
        return;
      }

      const allRows = JSON.parse(allRowsStr);

      // Load all entity mappings
      if (allMappingsStr) {
        const allMappings = JSON.parse(allMappingsStr);
        setAllEntityMappings(allMappings);

        // Process data for all entities
        const entityDataMap: { [key: string]: any[] } = {};
        const initialCheckedRows: { [key: string]: Set<number> } = {};

        for (const entity of ENTITIES) {
          if (allMappings[entity]) {
            const result = await api.processMappedData(allMappings[entity], allRows);
            entityDataMap[entity] = result.data;
            // Initialize all rows as checked
            initialCheckedRows[entity] = new Set(
              Array.from({ length: result.data.length }, (_, i) => i)
            );
          }
        }

        setAllEntityData(entityDataMap);
        setCheckedRows(initialCheckedRows);

        // Set initial entity
        const initialEntity = entityStr || 'Account';
        setSelectedEntity(initialEntity);

        if (entityDataMap[initialEntity]) {
          const entityData = entityDataMap[initialEntity];
          setData(entityData);

          if (entityData.length > 0) {
            setHeaders(Object.keys(entityData[0]));
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleEntityChange = (entity: string) => {
    setSelectedEntity(entity);

    // Update data and headers
    if (allEntityData[entity]) {
      const entityData = allEntityData[entity];
      setData(entityData);

      if (entityData.length > 0) {
        setHeaders(Object.keys(entityData[0]));
      }
    }
  };

  const handleRowCheckChange = (rowIndex: number) => {
    setCheckedRows((prev) => {
      const entityChecked = new Set(prev[selectedEntity] || []);

      if (entityChecked.has(rowIndex)) {
        entityChecked.delete(rowIndex);
      } else {
        entityChecked.add(rowIndex);
      }

      return {
        ...prev,
        [selectedEntity]: entityChecked,
      };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setCheckedRows((prev) => {
      return {
        ...prev,
        [selectedEntity]: checked
          ? new Set(Array.from({ length: data.length }, (_, i) => i))
          : new Set(),
      };
    });
  };

  const isAllChecked = () => {
    const entityChecked = checkedRows[selectedEntity] || new Set();
    return data.length > 0 && entityChecked.size === data.length;
  };

  const generateMappingPDF = async () => {
    setGenerating(true);
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const marginX = 15;
      const marginBottom = 20;

      // Title Page
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data Mapping Report', pageWidth / 2, 40, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 55, { align: 'center' });

      // Loop through all entities
      for (const entity of ENTITIES) {
        // Filter data based on checked rows
        const entityMappings = allEntityMappings[entity] || [];
        const allEntityRows = allEntityData[entity] || [];
        const entityChecked = checkedRows[entity] || new Set();
        const filteredEntityData = allEntityRows.filter((_, index) => entityChecked.has(index));

        // Skip entity if no rows are checked
        if (filteredEntityData.length === 0) continue;

        pdf.addPage();
        yPosition = 20;

        // Entity Header
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(66, 133, 244);
        pdf.text(`Entity: ${entity}`, marginX, yPosition);
        yPosition += 10;

        pdf.setDrawColor(66, 133, 244);
        pdf.setLineWidth(0.5);
        pdf.line(marginX, yPosition, pageWidth - marginX, yPosition);
        yPosition += 10;

        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);

        pdf.text(`Total Mappings: ${entityMappings.length}`, marginX, yPosition);
        yPosition += 6;
        pdf.text(`Total Records: ${filteredEntityData.length}`, marginX, yPosition);
        yPosition += 12;

        // Field Mappings Section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Field Mappings', marginX, yPosition);
        yPosition += 8;

        // Mappings Table
        pdf.setFontSize(10);
        const col1Width = 80;
        const col2Width = 80;
        const tableStartX = marginX;

        // Table Header
        pdf.setFillColor(66, 133, 244);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.rect(tableStartX, yPosition, col1Width, 8, 'F');
        pdf.rect(tableStartX + col1Width, yPosition, col2Width, 8, 'F');
        pdf.text('Source Field', tableStartX + 2, yPosition + 5.5);
        pdf.text('Target Field', tableStartX + col1Width + 2, yPosition + 5.5);

        yPosition += 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');

        // Table Data Rows
        entityMappings.forEach((mapping, index) => {
          if (yPosition > pageHeight - marginBottom) {
            pdf.addPage();
            yPosition = 20;
          }

          const bgColor = index % 2 === 0 ? 245 : 255;
          pdf.setFillColor(bgColor, bgColor, bgColor);
          pdf.rect(tableStartX, yPosition, col1Width, 7, 'F');
          pdf.rect(tableStartX + col1Width, yPosition, col2Width, 7, 'F');

          // Draw borders
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.1);
          pdf.rect(tableStartX, yPosition, col1Width, 7);
          pdf.rect(tableStartX + col1Width, yPosition, col2Width, 7);

          const sourceText = mapping.sourceField.length > 35 ? mapping.sourceField.substring(0, 32) + '...' : mapping.sourceField;
          const targetText = mapping.targetField.length > 35 ? mapping.targetField.substring(0, 32) + '...' : mapping.targetField;

          pdf.text(sourceText, tableStartX + 2, yPosition + 5);
          pdf.text(targetText, tableStartX + col1Width + 2, yPosition + 5);

          yPosition += 7;
        });

        yPosition += 10;

        // Data Preview Section
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Data Preview', marginX, yPosition);
        yPosition += 8;

        if (filteredEntityData.length > 0) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');

          const previewHeaders = Object.keys(filteredEntityData[0]);
          const tableWidth = pageWidth - 2 * marginX - 5;
          const colWidth = tableWidth / previewHeaders.length;
          const cellPadding = 1.5;

          const wrapText = (text: string, width: number) =>
            pdf.splitTextToSize(text, width);

          // Header row
          pdf.setFillColor(66, 133, 244);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');

          const headerLineCounts = previewHeaders.map((header) =>
            wrapText(header, colWidth - 2 * cellPadding).length
          );
          const headerMaxLines = Math.max(1, ...headerLineCounts);
          const headerHeight = Math.max(7, headerMaxLines * 4);
          if (yPosition + headerHeight > pageHeight - marginX) {
            pdf.addPage();
            yPosition = marginX;
          }
          previewHeaders.forEach((header, i) => {
            const x = marginX + i * colWidth;
            pdf.setFillColor(66, 133, 244);
            pdf.rect(x, yPosition, colWidth, headerHeight, 'F');

            // Add border to header cells
            pdf.setDrawColor(255, 255, 255);
            pdf.setLineWidth(0.3);
            pdf.rect(x, yPosition, colWidth, headerHeight);

            const headerLines = wrapText(header, colWidth - 2 * cellPadding);

            pdf.setTextColor(255, 255, 255);
            pdf.text(headerLines, x + cellPadding, yPosition + 4, {
              maxWidth: colWidth - 2 * cellPadding,
            });
          });

          yPosition += headerHeight;
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');

          // Data rows
          filteredEntityData.forEach((row, rowIndex) => {
            const lineCounts = previewHeaders.map((header) => {
              const value = String(row[header] ?? '');
              return wrapText(value, colWidth - 2 * cellPadding).length;
            });
            const maxLines = Math.max(1, ...lineCounts);
            const rowHeight = Math.max(6, maxLines * 4);

            if (yPosition + rowHeight > pageHeight - marginBottom) {
              pdf.addPage();
              yPosition = 20;
            }

            const bgColor = rowIndex % 2 === 0 ? 245 : 255;

            previewHeaders.forEach((header, colIndex) => {
              const x = marginX + colIndex * colWidth;
              pdf.setFillColor(bgColor, bgColor, bgColor);
              pdf.rect(x, yPosition, colWidth, rowHeight, 'F');

              pdf.setDrawColor(200, 200, 200);
              pdf.setLineWidth(0.1);
              pdf.rect(x, yPosition, colWidth, rowHeight);

              const value = String(row[header] ?? '');
              const lines = wrapText(value, colWidth - 2 * cellPadding);
              pdf.setTextColor(0, 0, 0);
              pdf.text(lines, x + cellPadding, yPosition + 4, {
                maxWidth: colWidth - 2 * cellPadding,
              });
            });

            yPosition += rowHeight;
          });
        } else {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(128, 128, 128);
          pdf.text('No data available for preview', marginX, yPosition);
        }
      }

      // Save PDF
      pdf.save(`complete_mapping_report_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = async () => {
    setProcessing(true);

    try {
      // Filter all entity data based on checked rows
      const filteredEntityData: { [key: string]: any[] } = {};

      for (const entity of ENTITIES) {
        const allEntityRows = allEntityData[entity] || [];
        const entityChecked = checkedRows[entity] || new Set();
        filteredEntityData[entity] = allEntityRows.filter(
          (_, index) => entityChecked.has(index)
        );
      }

      // Flatten and combine all checked data
      const allData = Object.values(filteredEntityData).flat();

      if (allData.length === 0) {
        alert('Please select at least one row to process.');
        return;
      }

      // Call API to load data
      await api.loadData(allData);

      navigate('/data-analytics');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading preview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE_OUTER}>
      <div className={PAGE_CONTAINER}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Data Preview</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and select data for processing</p>
        </div>

        <Card className="shadow-lg border border-border bg-card animate-in">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Mapped Data Preview</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Select an entity to view and preview the mapped data
                    </CardDescription>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label htmlFor="entity-select" className="font-semibold text-foreground text-sm">
                      Entity:
                    </label>
                    <select
                      id="entity-select"
                      value={selectedEntity}
                      onChange={(e) => handleEntityChange(e.target.value)}
                      className="flex-1 sm:flex-none h-10 px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-ring transition-colors font-medium"
                    >
                      {ENTITIES.map((entity) => (
                        <option key={entity} value={entity}>
                          {entity}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-medium bg-muted px-3 py-1.5 rounded-lg border border-border">
                      {checkedRows[selectedEntity]?.size || 0} selected of {data.length} rows
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={generateMappingPDF}
                disabled={generating || !checkedRows[selectedEntity]?.size}
                className="w-full lg:w-auto mt-2 lg:mt-8 font-semibold"
              >
                <Download className="mr-2 h-4 w-4" />
                {generating ? 'Generating...' : 'Download Report'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Data Table */}
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
              <div className="bg-primary text-primary-foreground px-6 py-3">
                <h3 className="font-semibold text-lg">Data Table</h3>
              </div>
              <div className="max-h-96 overflow-auto">
                {data.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted sticky top-0">
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={isAllChecked()}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded w-4 h-4 cursor-pointer"
                            title="Select all rows"
                            aria-label="Select all rows"
                          />
                        </TableHead>
                        {headers.map((header, index) => (
                          <TableHead key={index} className="font-semibold text-foreground whitespace-nowrap">{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, rowIndex) => (
                        <TableRow key={rowIndex} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="w-12">
                            <input
                              type="checkbox"
                              checked={checkedRows[selectedEntity]?.has(rowIndex) || false}
                              onChange={() => handleRowCheckChange(rowIndex)}
                              className="rounded w-4 h-4 cursor-pointer"
                              title={`Toggle row ${rowIndex + 1}`}
                              aria-label={`Toggle row ${rowIndex + 1}`}
                            />
                          </TableCell>
                          {headers.map((header, colIndex) => (
                            <TableCell key={colIndex} className="whitespace-nowrap">{row[header]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">No data available for this entity</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/field-mapping')}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={processing || !checkedRows[selectedEntity]?.size}
                className="w-full sm:w-auto px-8 h-11 font-semibold order-1 sm:order-2"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Process Data
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