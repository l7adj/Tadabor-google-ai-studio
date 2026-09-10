import React from 'react';
import { Header } from './Header';
import { TadabburCanvas } from './Canvas/TadabburCanvas';
import { QuranSearchPanel } from './Search/QuranSearchPanel';
import { PresentationView } from './Presentation/PresentationView';
import { MindMapTemplatesModal } from './Canvas/MindMapTemplatesModal';
import { QuickAyahPickerModal } from './Search/QuickAyahPickerModal';
import { TadabburMap, SearchResultItem, QuranAnchor } from '../types';
import { MindMapTemplate } from '../lib/mindMapTemplates';
import { CheckCircle2 } from 'lucide-react';

export interface AppShellProps {
  currentMap: TadabburMap;
  maps: TadabburMap[];
  activeTab: 'canvas' | 'search' | 'presentation';
  setActiveTab: (tab: 'canvas' | 'search' | 'presentation') => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  toastMessage: string | null;
  onSelectMap: (mapId: string) => void;
  onCreateMap: () => void;
  onDeleteMap: (mapId: string) => void;
  onUpdateMapTitle: (title: string) => void;
  onUpdateMap: (updatedMap: TadabburMap) => void;
  onExportMap: () => void;
  onImportMap: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyTemplate: (template: MindMapTemplate, asNewMap: boolean) => void;
  onAddAyahToCanvas: (item: SearchResultItem, anchor?: QuranAnchor) => void;
  onAddReflectionToCanvas?: (
    item: SearchResultItem,
    reflectionData: {
      observation: string;
      question: string;
      insight: string;
      action?: string;
    }
  ) => void;
  onSelectQuickAyahs: (items: SearchResultItem[], anchor?: QuranAnchor) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isTemplatesModalOpen: boolean;
  setIsTemplatesModalOpen: (open: boolean) => void;
  isQuickPickerModalOpen: boolean;
  setIsQuickPickerModalOpen: (open: boolean) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentMap,
  maps,
  activeTab,
  setActiveTab,
  zoom,
  setZoom,
  toastMessage,
  onSelectMap,
  onCreateMap,
  onDeleteMap,
  onUpdateMapTitle,
  onUpdateMap,
  onExportMap,
  onImportMap,
  onApplyTemplate,
  onAddAyahToCanvas,
  onAddReflectionToCanvas,
  onSelectQuickAyahs,
  isSearchModalOpen,
  setIsSearchModalOpen,
  isTemplatesModalOpen,
  setIsTemplatesModalOpen,
  isQuickPickerModalOpen,
  setIsQuickPickerModalOpen
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-tajawal antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      {activeTab !== 'presentation' && (
        <Header
          currentMap={currentMap}
          maps={maps}
          onSelectMap={onSelectMap}
          onCreateMap={onCreateMap}
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          onOpenQuickAyahPicker={() => setIsQuickPickerModalOpen(true)}
          onDeleteMap={onDeleteMap}
          onUpdateMapTitle={onUpdateMapTitle}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onExportMap={onExportMap}
          onImportMap={onImportMap}
          onResetZoom={() => setZoom(1)}
          zoom={zoom}
        />
      )}

      {/* Body View Mode Content */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'canvas' && (
          <TadabburCanvas
            currentMap={currentMap}
            onUpdateMap={onUpdateMap}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            onOpenQuickAyahPicker={() => setIsQuickPickerModalOpen(true)}
            zoom={zoom}
            setZoom={setZoom}
          />
        )}

        {activeTab === 'search' && (
          <QuranSearchPanel
            onAddAyahToCanvas={(item) => {
              onAddAyahToCanvas(item);
            }}
            onAddReflectionToCanvas={onAddReflectionToCanvas}
          />
        )}

        {activeTab === 'presentation' && (
          <PresentationView
            map={currentMap}
            onExit={() => setActiveTab('canvas')}
          />
        )}
      </main>

      {/* Quick Search Modal over Canvas */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200">
            <QuranSearchPanel
              onAddAyahToCanvas={(item) => {
                onAddAyahToCanvas(item);
              }}
              onAddReflectionToCanvas={onAddReflectionToCanvas}
              onClose={() => setIsSearchModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Mind Map Templates Gallery Modal */}
      {isTemplatesModalOpen && (
        <MindMapTemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onApplyTemplate={onApplyTemplate}
        />
      )}

      {/* Quick Ayah Picker Modal */}
      {isQuickPickerModalOpen && (
        <QuickAyahPickerModal
          isOpen={isQuickPickerModalOpen}
          onClose={() => setIsQuickPickerModalOpen(false)}
          onAddAyahs={onSelectQuickAyahs}
          onOpenDeepSearch={() => {
            setIsQuickPickerModalOpen(false);
            setIsSearchModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
