import React, { useState } from 'react';
import {
  X,
  Sparkles,
  LayoutGrid,
  GitCompare,
  GitBranch,
  ArrowRightCircle,
  Columns,
  BookOpen,
  Check,
  Plus,
  Compass,
  Layers,
  Info
} from 'lucide-react';
import { MIND_MAP_TEMPLATES, MindMapTemplate } from '../../lib/mindMapTemplates';

interface MindMapTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: MindMapTemplate, mode: 'new' | 'append') => void;
}

export const MindMapTemplatesModal: React.FC<MindMapTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(MIND_MAP_TEMPLATES[0].id);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'جميع الهياكل' },
    { id: 'thematic', label: 'تفسير موضوعي' },
    { id: 'comparative', label: 'بلاغة ومتشابهات' },
    { id: 'etymology', label: 'اشتقاق وجذور' },
    { id: 'journey', label: 'مسار وتطبيق عملي' },
    { id: 'contrast', label: 'موازنات ومقابلات' },
    { id: 'narrative', label: 'قصص وعبر' }
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? MIND_MAP_TEMPLATES
    : MIND_MAP_TEMPLATES.filter((t) => t.category === selectedCategory);

  const activeTemplate = MIND_MAP_TEMPLATES.find((t) => t.id === selectedTemplateId) || MIND_MAP_TEMPLATES[0];

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid':
        return <LayoutGrid className="w-5 h-5" />;
      case 'GitCompare':
        return <GitCompare className="w-5 h-5" />;
      case 'GitBranch':
        return <GitBranch className="w-5 h-5" />;
      case 'ArrowRightCircle':
        return <ArrowRightCircle className="w-5 h-5" />;
      case 'Columns':
        return <Columns className="w-5 h-5" />;
      case 'BookOpen':
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-cairo">
                معرض قوالب وهياكل الخرائط التدبرية
              </h2>
              <p className="text-xs text-stone-500 font-tajawal mt-0.5">
                نماذج منهجية معتمدة جاهزة للبدء الفوري مع روابط بيانية وعقد تدبرية متكاملة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-2.5 bg-white border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all font-cairo ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modal Body: Split Layout (Templates Grid + Live Detail Inspector) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Templates Grid List (7 cols on md) */}
          <div className="md:col-span-7 p-4 sm:p-6 border-b md:border-b-0 md:border-l border-stone-100 space-y-3 overflow-y-auto max-h-[500px]">
            {filteredTemplates.map((template) => {
              const isSelected = template.id === activeTemplate.id;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {getTemplateIcon(template.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-stone-900 font-cairo">
                            {template.title}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium font-tajawal">
                            {template.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-tajawal mt-1 line-clamp-2 leading-relaxed">
                          {template.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                      {template.badge}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Layers className="w-3 h-3 text-stone-400" />
                        {template.nodesCount} عناصر
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Compass className="w-3 h-3 text-stone-400" />
                        {template.edgesCount} مسارات ربط
                      </span>
                    </div>

                    {isSelected && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 font-cairo">
                        <Check className="w-3.5 h-3.5" />
                        محدد للعرض
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Template Deep Inspector (5 cols on md) */}
          <div className="md:col-span-5 p-5 sm:p-6 bg-stone-50/50 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full font-cairo">
                  {activeTemplate.categoryLabel}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-cairo mt-2">
                  {activeTemplate.title}
                </h3>
                <p className="text-xs text-stone-600 font-tajawal leading-relaxed mt-2">
                  {activeTemplate.description}
                </p>
              </div>

              {/* Blueprint structure visualization */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
                <h4 className="text-xs font-bold text-stone-800 font-cairo flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  مكونات الهيكل التدبري
                </h4>
                <div className="space-y-1.5 text-xs text-stone-600 font-tajawal">
                  {activeTemplate.nodes.map((node, i) => (
                    <div key={node.id} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-stone-50 border border-stone-100">
                      <span className={`w-2 h-2 rounded-full ${
                        node.type === 'ayah' ? 'bg-amber-500' :
                        node.type === 'concept' ? 'bg-indigo-500' :
                        node.type === 'note' ? 'bg-emerald-500' : 'bg-stone-400'
                      }`} />
                      <span className="font-semibold text-[11px] text-stone-800">
                        {node.type === 'ayah' && node.ayahData
                          ? `آية: سورة ${node.ayahData.surahName} [${node.ayahData.ayahNumberInSurah}]`
                          : node.type === 'concept' && node.conceptData
                          ? `محور: ${node.conceptData.title}`
                          : node.type === 'note' && node.noteData
                          ? `وقفة: ${node.noteData.title}`
                          : 'عنصر تدبري'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodological Guidance */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 font-tajawal leading-relaxed">
                💡 <span className="font-semibold">توجيه منهجي:</span> يمكنك بعد فتح القالب تعديل الآيات والكلمات ونصوص الوقفات والروابط بكل حرية وتوسيع الخريطة كيفما تشاء.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-5 mt-4 border-t border-stone-200 space-y-2">
              <button
                onClick={() => {
                  onApplyTemplate(activeTemplate, 'new');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.01] font-cairo"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء خريطة جديدة بهذا الهيكل</span>
              </button>

              <button
                onClick={() => {
                  onApplyTemplate(activeTemplate, 'append');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold py-2 px-4 rounded-xl transition-all font-cairo"
                title="إدراج عناصر هذا القالب في الخريطة المفتوحة حالياً دون مسح الموجود"
              >
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>إدراج في الخريطة الحالية</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
