import React, { useState } from 'react';
import { AppShell } from './components/AppShell';
import { useMapDomain } from './domains/map/useMapDomain';
import { useSearchCanvasIntegration } from './domains/search/useSearchCanvasIntegration';
import { useMapPersistence } from './services/persistenceService';

/**
 * App - Pure Composition Root
 * Deconstructed architecture adhering to domain-driven separation:
 * - AppShell: View presentation, tab routing, and modal layers
 * - useMapDomain: Maps state, lifecycle operations, and templates
 * - useSearchCanvasIntegration: Ayah coordinates & anchor placement pipeline
 * - useMapPersistence: Non-blocking debounced storage service with unload flush
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'search' | 'presentation'>('canvas');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isQuickPickerModalOpen, setIsQuickPickerModalOpen] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Map Domain
  const {
    maps,
    currentMap,
    selectMap,
    createMap,
    deleteMap,
    updateMapTitle,
    updateMap,
    applyTemplate,
    exportMap,
    importMap
  } = useMapDomain({ onNotify: showToast });

  // 2. Persistence Service (debounced 750ms + synchronous flush on beforeunload)
  useMapPersistence(maps);

  // 3. Search & Canvas Integration
  const { addAyahToCanvas, addQuickAyahs } = useSearchCanvasIntegration({
    currentMap,
    onUpdateMap: updateMap,
    onNotify: showToast
  });

  const handleSelectMap = (mapId: string) => {
    selectMap(mapId);
    setZoom(1);
  };

  return (
    <AppShell
      currentMap={currentMap}
      maps={maps}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      zoom={zoom}
      setZoom={setZoom}
      toastMessage={toastMessage}
      onSelectMap={handleSelectMap}
      onCreateMap={createMap}
      onDeleteMap={deleteMap}
      onUpdateMapTitle={updateMapTitle}
      onUpdateMap={updateMap}
      onExportMap={exportMap}
      onImportMap={importMap}
      onApplyTemplate={applyTemplate}
      onAddAyahToCanvas={addAyahToCanvas}
      onSelectQuickAyahs={addQuickAyahs}
      isSearchModalOpen={isSearchModalOpen}
      setIsSearchModalOpen={setIsSearchModalOpen}
      isTemplatesModalOpen={isTemplatesModalOpen}
      setIsTemplatesModalOpen={setIsTemplatesModalOpen}
      isQuickPickerModalOpen={isQuickPickerModalOpen}
      setIsQuickPickerModalOpen={setIsQuickPickerModalOpen}
    />
  );
}
