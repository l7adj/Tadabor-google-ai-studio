import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  FolderOpen,
  Eye,
  Sparkles,
  Download,
  Upload,
  MoreHorizontal,
  ChevronDown,
  Check,
  Edit2
} from 'lucide-react';
import { TadabburMap } from '../types';

interface HeaderProps {
  currentMap: TadabburMap;
  maps: TadabburMap[];
  onSelectMap: (mapId: string) => void;
  onCreateMap: () => void;
  onOpenTemplates: () => void;
  onOpenQuickAyahPicker: () => void;
  onDeleteMap: (mapId: string) => void;
  onUpdateMapTitle: (title: string) => void;
  activeTab: 'canvas' | 'search' | 'presentation';
  setActiveTab: (tab: 'canvas' | 'search' | 'presentation') => void;
  onOpenSearch: () => void;
  onExportMap: () => void;
  onImportMap: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetZoom: () => void;
  zoom: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMap,
  maps,
  onSelectMap,
  onCreateMap,
  onOpenTemplates,
  onOpenQuickAyahPicker,
  onDeleteMap,
  onUpdateMapTitle,
  activeTab,
  setActiveTab,
  onOpenSearch,
  onExportMap,
  onImportMap
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentMap.title);
  const [showMapMenu, setShowMapMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mapMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (mapMenuRef.current && !mapMenuRef.current.contains(e.target as Node)) {
        setShowMapMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onUpdateMapTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-stone-200 px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 select-none">
      {/* 1. Brand and Map Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-emerald-100" />
          </div>
          <span className="text-base font-bold tracking-tight text-stone-900 font-cairo">
            تدبّر
          </span>
        </div>

        <div className="h-4 w-px bg-stone-300 mx-1 hidden sm:block" />

        {/* Map Selector & Inline Title Renamer */}
        <div className="relative" ref={mapMenuRef}>
          <div className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  className="text-xs font-semibold border-b border-emerald-600 bg-white outline-none w-32 sm:w-48 text-stone-900 px-1 py-0.5"
                />
                <button
                  onClick={handleTitleSubmit}
                  className="text-emerald-700 hover:text-emerald-900 p-0.5"
                  title="حفظ الاسم"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowMapMenu(!showMapMenu)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950 truncate"
                  title="اختيار خريطة تدبرية"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] truncate">
                    {currentMap.title}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                </button>
                <button
                  onClick={() => {
                    setTitleInput(currentMap.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-stone-400 hover:text-stone-700 p-0.5 hidden sm:inline"
                  title="تعديل اسم الخريطة"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>

          {/* Map dropdown */}
          {showMapMenu && (
            <div className="absolute top-full mt-1.5 right-0 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 px-1">
                <span className="text-xs font-bold text-stone-700 font-cairo">خرائطي</span>
                <button
                  onClick={() => {
                    onCreateMap();
                    setShowMapMenu(false);
                  }}
                  className="flex items-center gap-1 text-[11px] text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-md font-semibold transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  خريطة جديدة
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto my-1 space-y-0.5">
                {maps.map((map) => (
                  <div
                    key={map.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      map.id === currentMap.id
                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelectMap(map.id);
                        setShowMapMenu(false);
                      }}
                      className="flex-1 text-right truncate pl-2 font-cairo"
                    >
                      {map.title}
                    </button>
                    {maps.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMap(map.id);
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="حذف الخريطة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Navigation: [ تدبّر | بحث | ⋯ المزيد ] */}
      <div className="flex items-center bg-stone-100/90 p-1 rounded-xl border border-stone-200">
        {/* تدبّر (Canvas) */}
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'canvas'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-cairo">تدبّر</span>
        </button>

        {/* بحث (Quran Search) */}
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-amber-700" />
          <span className="font-cairo">بحث</span>
        </button>

        {/* ⋯ المزيد (Secondary Tools Drawer) */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showMoreMenu || activeTab === 'presentation'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="المزيد من الأدوات والقوالب والعرض"
          >
            <MoreHorizontal className="w-4 h-4 text-stone-600" />
            <span className="font-cairo hidden sm:inline">المزيد</span>
          </button>

          {showMoreMenu && (
            <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-tajawal">
              {/* Presentation View */}
              <button
                onClick={() => {
                  setActiveTab('presentation');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-colors text-right"
              >
                <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>العرض المتأمل الهادئ</span>
              </button>

              {/* Templates */}
              <button
                onClick={() => {
                  onOpenTemplates();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-950 rounded-xl transition-colors text-right"
              >
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>قوالب وهياكل تدبرية</span>
              </button>

              {/* Quick Ayah Picker */}
              <button
                onClick={() => {
                  onOpenQuickAyahPicker();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-950 rounded-xl transition-colors text-right"
              >
                <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                <span>منتقي الآيات السريع</span>
              </button>

              {/* In-Canvas Search Modal */}
              <button
                onClick={() => {
                  onOpenSearch();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-950 rounded-xl transition-colors text-right"
              >
                <Search className="w-4 h-4 text-stone-600 shrink-0" />
                <span>البحث المتقدم في المصحف</span>
              </button>

              <div className="h-px bg-stone-100 my-1" />

              {/* Export Map */}
              <button
                onClick={() => {
                  onExportMap();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-950 rounded-xl transition-colors text-right"
              >
                <Download className="w-4 h-4 text-stone-500 shrink-0" />
                <span>تصدير الخريطة (JSON)</span>
              </button>

              {/* Import Map */}
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-950 rounded-xl transition-colors text-right"
              >
                <Upload className="w-4 h-4 text-stone-500 shrink-0" />
                <span>استيراد خريطة (JSON)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for importing map */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onImportMap}
        className="hidden"
      />
    </header>
  );
};
