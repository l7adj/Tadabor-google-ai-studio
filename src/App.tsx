import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TadabburCanvas } from './components/Canvas/TadabburCanvas';
import { QuranSearchPanel } from './components/Search/QuranSearchPanel';
import { PresentationView } from './components/Presentation/PresentationView';
import { MindMapTemplatesModal } from './components/Canvas/MindMapTemplatesModal';
import { QuickAyahPickerModal } from './components/Search/QuickAyahPickerModal';
import { TadabburMap, CanvasNode, CanvasEdge, SearchResultItem, QuranAnchor, WordAnnotation } from './types';
import { MindMapTemplate } from './lib/mindMapTemplates';
import {
  getStoredMaps,
  saveStoredMaps,
  getActiveMapId,
  setActiveMapId,
  STARTER_MAPS
} from './lib/storage';
import { cleanSurahName } from './lib/arabicUtils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [maps, setMaps] = useState<TadabburMap[]>(() => getStoredMaps());
  const [activeMapId, setActiveMapIdState] = useState<string>(() => getActiveMapId());
  const [activeTab, setActiveTab] = useState<'canvas' | 'search' | 'presentation'>('canvas');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isQuickPickerModalOpen, setIsQuickPickerModalOpen] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync active map
  const currentMap = maps.find((m) => m.id === activeMapId) || maps[0] || STARTER_MAPS[0];

  useEffect(() => {
    saveStoredMaps(maps);
  }, [maps]);

  useEffect(() => {
    setActiveMapId(activeMapId);
  }, [activeMapId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectMap = (mapId: string) => {
    setActiveMapIdState(mapId);
    setZoom(1);
  };

  const handleCreateMap = () => {
    const newMap: TadabburMap = {
      id: `map-${Date.now()}`,
      title: `خريطة تدبّر جديدة ${maps.length + 1}`,
      description: 'لوحة تدبّر وخرائط ذهنية جديدة',
      nodes: [],
      edges: [],
      zoom: 1,
      panX: 40,
      panY: 30,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newMap, ...maps];
    setMaps(updated);
    setActiveMapIdState(newMap.id);
    showToast('تم إنشاء خريطة تدبّر جديدة');
  };

  const handleDeleteMap = (mapId: string) => {
    if (maps.length <= 1) {
      alert('لا يمكن حذف الخريطة الوحيدة المتبقية');
      return;
    }
    const filtered = maps.filter((m) => m.id !== mapId);
    setMaps(filtered);
    if (activeMapId === mapId) {
      setActiveMapIdState(filtered[0].id);
    }
    showToast('تم حذف الخريطة');
  };

  const handleUpdateMapTitle = (title: string) => {
    const updated = maps.map((m) => (m.id === currentMap.id ? { ...m, title, updatedAt: Date.now() } : m));
    setMaps(updated);
  };

  const handleUpdateMap = (updatedMap: TadabburMap) => {
    const updated = maps.map((m) => (m.id === updatedMap.id ? updatedMap : m));
    setMaps(updated);
  };

  // Add Ayah to current canvas from search
  const handleAddAyahToCanvas = (item: SearchResultItem, anchor?: QuranAnchor) => {
    // Determine position: place to right of last node or near center
    const existingNodes = currentMap.nodes;
    let newX = 120;
    let newY = 120;

    if (existingNodes.length > 0) {
      const lastNode = existingNodes[existingNodes.length - 1];
      newX = lastNode.x + 30;
      newY = lastNode.y + 160;
      if (newY > 800) {
        newY = 100;
        newX = lastNode.x + 360;
      }
    }

    const annotations: WordAnnotation[] = [];
    if (anchor && anchor.startWord !== undefined) {
      annotations.push({
        id: `ann-${Date.now()}`,
        wordIndex: anchor.startWord,
        endWordIndex: anchor.endWord,
        wordText: anchor.text,
        type: 'highlight',
        color: '#d97706',
        note: 'موضع ارتكاز تدبري',
        anchor: anchor
      });
    }

    const newNode: CanvasNode = {
      id: `ayah-${item.overallAyahNumber}-${Date.now()}`,
      type: 'ayah',
      x: newX,
      y: newY,
      width: 380,
      colorTheme:
        item.revelationType === 'Meccan'
          ? existingNodes.length % 2 === 0
            ? 'emerald'
            : 'teal'
          : 'amber',
      anchor: anchor,
      ayahData: {
        surahNumber: item.surahNumber,
        surahName: cleanSurahName(item.surahName),
        ayahNumberInSurah: item.ayahNumberInSurah,
        overallAyahNumber: item.overallAyahNumber,
        page: item.page,
        juz: item.juz,
        revelationType: item.revelationType,
        textUthmani: item.textUthmani,
        textSimple: item.textSimple,
        annotations: annotations,
        focusedAnchor: anchor
      }
    };

    const updatedMap: TadabburMap = {
      ...currentMap,
      nodes: [...currentMap.nodes, newNode],
      updatedAt: Date.now()
    };

    handleUpdateMap(updatedMap);
    if (anchor && anchor.level === 'word') {
      showToast(`تمت إضافة آية مع ارتكاز على كلمة «${anchor.text}»`);
    } else {
      showToast(`تمت إضافة سورة ${cleanSurahName(item.surahName)} [آية ${item.ayahNumberInSurah}] إلى الخريطة`);
    }
  };

  // Add multiple ayahs from Quick Ayah Picker
  const handleSelectQuickAyahs = (items: SearchResultItem[], anchor?: QuranAnchor) => {
    if (!items || items.length === 0) return;
    if (items.length === 1 && anchor) {
      handleAddAyahToCanvas(items[0], anchor);
    } else {
      items.forEach((item) => handleAddAyahToCanvas(item));
    }
  };

  // Apply Mind Map Template
  const handleApplyTemplate = (template: MindMapTemplate, asNewMap: boolean) => {
    const templateNodes: CanvasNode[] = JSON.parse(JSON.stringify(template.nodes));
    const templateEdges: CanvasEdge[] = JSON.parse(JSON.stringify(template.edges));

    if (asNewMap) {
      const newMap: TadabburMap = {
        id: `map-${Date.now()}`,
        title: template.title,
        description: template.description,
        nodes: templateNodes,
        edges: templateEdges,
        zoom: 1,
        panX: 40,
        panY: 40,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setMaps([newMap, ...maps]);
      setActiveMapIdState(newMap.id);
      showToast(`تم إنشاء خريطة جديدة بهيكل: ${template.title}`);
    } else {
      const existingCount = currentMap.nodes.length;
      const offsetX = existingCount > 0 ? 500 : 0;
      const offsetNodes = templateNodes.map((n) => ({
        ...n,
        id: `${n.id}-${Date.now()}`,
        x: n.x + offsetX
      }));

      const idMap = new Map<string, string>();
      templateNodes.forEach((n, idx) => {
        idMap.set(n.id, offsetNodes[idx].id);
      });

      const offsetEdges = templateEdges.map((e) => ({
        ...e,
        id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: idMap.get(e.sourceId) || e.sourceId,
        targetId: idMap.get(e.targetId) || e.targetId
      }));

      const updatedMap: TadabburMap = {
        ...currentMap,
        nodes: [...currentMap.nodes, ...offsetNodes],
        edges: [...currentMap.edges, ...offsetEdges],
        updatedAt: Date.now()
      };
      handleUpdateMap(updatedMap);
      showToast(`تمت إضافة هيكل: ${template.title} إلى اللوحة الحالية`);
    }
  };

  // Export Map as JSON
  const handleExportMap = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentMap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentMap.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تحميل ملف الخريطة بنجاح');
  };

  // Import Map from JSON
  const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as TadabburMap;
        if (!imported.title || !Array.isArray(imported.nodes)) {
          throw new Error('الملف غير صالح');
        }
        imported.id = `imported-${Date.now()}`;
        imported.createdAt = Date.now();
        imported.updatedAt = Date.now();
        setMaps([imported, ...maps]);
        setActiveMapIdState(imported.id);
        showToast(`تم استيراد خريطة "${imported.title}" بنجاح`);
      } catch (err) {
        alert('حدث خطأ أثناء استيراد الملف. يرجى التأكد من اختيار ملف خريطة تدبر صالح.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
          onSelectMap={handleSelectMap}
          onCreateMap={handleCreateMap}
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          onOpenQuickAyahPicker={() => setIsQuickPickerModalOpen(true)}
          onDeleteMap={handleDeleteMap}
          onUpdateMapTitle={handleUpdateMapTitle}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onExportMap={handleExportMap}
          onImportMap={handleImportMap}
          onResetZoom={() => setZoom(1)}
          zoom={zoom}
        />
      )}

      {/* Body View Mode Content */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'canvas' && (
          <TadabburCanvas
            currentMap={currentMap}
            onUpdateMap={handleUpdateMap}
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
              handleAddAyahToCanvas(item);
            }}
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
                handleAddAyahToCanvas(item);
              }}
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
          onApplyTemplate={handleApplyTemplate}
        />
      )}

      {/* Quick Ayah Picker Modal */}
      {isQuickPickerModalOpen && (
        <QuickAyahPickerModal
          isOpen={isQuickPickerModalOpen}
          onClose={() => setIsQuickPickerModalOpen(false)}
          onAddAyahs={handleSelectQuickAyahs}
          onOpenDeepSearch={() => {
            setIsQuickPickerModalOpen(false);
            setIsSearchModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
