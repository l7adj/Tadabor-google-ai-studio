import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Share2,
  FolderOpen,
  Eye,
  Sliders,
  Sparkles,
  Download,
  Upload,
  RotateCcw
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
  onImportMap,
  onResetZoom,
  zoom
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentMap.title);
  const [showMapMenu, setShowMapMenu] = useState(false);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onUpdateMapTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-stone-200 px-2 sm:px-4 flex items-center justify-between z-30 sticky top-0 shadow-xs select-none">
      {/* Right Brand & Map Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Project Logo Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-850 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-stone-900 flex items-center gap-1 font-cairo">
              تدبّر
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full hidden sm:inline">
                المتكامل
              </span>
            </h1>
          </div>
        </div>

        <div className="h-6 w-px bg-stone-200 mx-0.5 hidden sm:block" />

        {/* Map Selector & Title */}
        <div className="relative">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-stone-100 hover:bg-stone-200/80 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors">
            <button
              onClick={() => setShowMapMenu(!showMapMenu)}
              className="flex items-center gap-1 text-xs font-semibold text-stone-800 hover:text-stone-950 truncate"
              title="تغيير الخريطة الذهنية الحالية"
            >
              <FolderOpen className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span className="max-w-[80px] xs:max-w-[110px] sm:max-w-[180px] truncate">
                {currentMap.title}
              </span>
            </button>

            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="text-xs font-medium border border-emerald-500 rounded px-1.5 py-0.5 bg-white outline-none w-28 sm:w-48 text-stone-900"
              />
            ) : (
              <button
                onClick={() => {
                  setTitleInput(currentMap.title);
                  setIsEditingTitle(true);
                }}
                className="text-[10px] text-stone-400 hover:text-stone-700 underline px-1 hidden sm:inline"
                title="تعديل اسم الخريطة"
              >
                تعديل
              </button>
            )}
          </div>

          {/* Map dropdown */}
          {showMapMenu && (
            <div className="absolute top-full mt-1.5 right-0 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 px-2 gap-1.5">
                <span className="text-xs font-bold text-stone-700 font-cairo">الخرائط الذهنية</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onOpenTemplates();
                      setShowMapMenu(false);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-900 hover:bg-amber-100 px-2 py-1 rounded-lg font-bold transition-colors font-cairo"
                    title="فتح معرض القوالب التدبرية الجاهزة"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    قوالب
                  </button>
                  <button
                    onClick={() => {
                      onCreateMap();
                      setShowMapMenu(false);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg font-medium transition-colors font-cairo"
                  >
                    <Plus className="w-3 h-3" />
                    خريطة فارغة
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto my-1 space-y-1">
                {maps.map((map) => (
                  <div
                    key={map.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                      map.id === currentMap.id
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
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
                          if (confirm(`هل أنت متأكد من حذف خريطة "${map.title}"؟`)) {
                            onDeleteMap(map.id);
                          }
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors"
                        title="حذف الخريطة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'canvas'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-cairo">الورقة</span>
          <span className="hidden md:inline font-cairo font-normal">الذكية</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-cairo">الباحث</span>
          <span className="hidden md:inline font-cairo font-normal">القرآني</span>
        </button>

        <button
          onClick={() => setActiveTab('presentation')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'presentation'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          title="واجهة العرض التقديمي الهادئة والشرح"
        >
          <Eye className="w-3.5 h-3.5 text-amber-200 shrink-0" />
          <span className="font-cairo">العرض</span>
          <span className="hidden md:inline font-cairo font-normal">المتأمل</span>
        </button>
      </div>

      {/* Left Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {activeTab === 'canvas' && (
          <>
            {/* Mind Map Templates Shortcut */}
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] font-cairo"
              title="تصفح قوالب وهياكل الخرائط التدبرية الجاهزة"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">قوالب</span>
              <span>الهياكل</span>
            </button>

            {/* Quick Ayah Picker Shortcut */}
            <button
              onClick={onOpenQuickAyahPicker}
              className="flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors shadow-2xs font-cairo"
              title="إدراج آية كريمة بالرقم والسورة مباشرة"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">منتقي</span>
              <span>الآيات</span>
            </button>

            {/* Deep Search Shortcut */}
            <button
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors shadow-2xs font-cairo"
              title="البحث المتقدم بالمعنى أو الجذر اللغوي"
            >
              <Search className="w-3.5 h-3.5 text-amber-700" />
              <span>بحث الآيات</span>
            </button>

            {/* Export & Import */}
            <button
              onClick={onExportMap}
              className="p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="تصدير الخريطة (حفظ ملف JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              className="p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="استيراد خريطة من ملف JSON"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={onImportMap}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </header>
  );
};
