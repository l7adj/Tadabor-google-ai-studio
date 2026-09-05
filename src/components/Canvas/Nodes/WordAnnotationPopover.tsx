import React, { useState, useMemo } from 'react';
import {
  Circle,
  Highlighter,
  Underline,
  MessageSquare,
  Link,
  Trash2,
  X,
  Check,
  Plus,
  Minus,
  Sparkles,
  Layers
} from 'lucide-react';
import { WordAnnotation } from '../../../types';
import { extractWordLetters } from '../../../lib/arabicUtils';

interface WordAnnotationPopoverProps {
  wordIndex: number;
  wordText: string;
  allAyahWords: Array<{ index: number; uthmani: string; simple: string }>;
  currentAnnotation: WordAnnotation;
  onSaveAnnotation: (annotation: WordAnnotation) => void;
  onRemoveAnnotation: (wordIndex: number) => void;
  onStartConnectionFromWord: (wordIndex: number, designatedText?: string) => void;
  onClose: () => void;
}

const CONTRAST_COLORS = [
  { name: 'ياقوتي مميز', value: '#e11d48', bg: 'bg-rose-600', ring: 'ring-rose-400' },
  { name: 'ذهبي عنبري', value: '#d97706', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { name: 'زمردي قرآني', value: '#059669', bg: 'bg-emerald-600', ring: 'ring-emerald-400' },
  { name: 'أزرق ملكي', value: '#2563eb', bg: 'bg-blue-600', ring: 'ring-blue-400' },
  { name: 'بنفسجي عميق', value: '#7c3aed', bg: 'bg-purple-600', ring: 'ring-purple-400' },
  { name: 'برتقالي ناري', value: '#ea580c', bg: 'bg-orange-600', ring: 'ring-orange-400' }
];

export const WordAnnotationPopover: React.FC<WordAnnotationPopoverProps> = ({
  wordIndex,
  wordText,
  allAyahWords,
  currentAnnotation,
  onSaveAnnotation,
  onRemoveAnnotation,
  onStartConnectionFromWord,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<'circle' | 'highlight' | 'underline'>(
    currentAnnotation.type || 'circle'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    currentAnnotation.color || '#e11d48'
  );
  const [endWordIndex, setEndWordIndex] = useState<number | undefined>(
    currentAnnotation.endWordIndex
  );
  const [selectedChar, setSelectedChar] = useState<{ index?: number; text?: string }>({
    index: currentAnnotation.charIndex,
    text: currentAnnotation.charText
  });
  const [note, setNote] = useState<string>(currentAnnotation.note || '');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(Boolean(currentAnnotation.note));

  // Letters of the primary designated word
  const letters = useMemo(() => extractWordLetters(wordText), [wordText]);

  // Compute designated phrase text
  const designatedText = useMemo(() => {
    if (selectedChar.text) {
      return `حرف "${selectedChar.text}" في (${wordText})`;
    }
    if (endWordIndex !== undefined && endWordIndex > wordIndex) {
      const slice = allAyahWords.slice(wordIndex, endWordIndex + 1);
      return slice.map((w) => w.uthmani).join(' ');
    }
    return wordText;
  }, [selectedChar, endWordIndex, wordIndex, wordText, allAyahWords]);

  // Helper to sync update immediately
  const updateAnnotation = (overrides: Partial<WordAnnotation>) => {
    const updated: WordAnnotation = {
      ...currentAnnotation,
      type: overrides.type ?? selectedType,
      color: overrides.color ?? selectedColor,
      endWordIndex: 'endWordIndex' in overrides ? overrides.endWordIndex : endWordIndex,
      phraseText: 'phraseText' in overrides ? overrides.phraseText : (endWordIndex && endWordIndex > wordIndex ? designatedText : undefined),
      charIndex: 'charIndex' in overrides ? overrides.charIndex : selectedChar.index,
      charText: 'charText' in overrides ? overrides.charText : selectedChar.text,
      note: 'note' in overrides ? overrides.note : (note.trim() || undefined)
    };
    onSaveAnnotation(updated);
  };

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    updateAnnotation({ color: newColor });
  };

  const handleTypeChange = (newType: 'circle' | 'highlight' | 'underline') => {
    setSelectedType(newType);
    updateAnnotation({ type: newType });
  };

  const handleExpandWords = () => {
    const currentEnd = endWordIndex ?? wordIndex;
    if (currentEnd < allAyahWords.length - 1) {
      const newEnd = currentEnd + 1;
      setEndWordIndex(newEnd);
      setSelectedChar({ index: undefined, text: undefined });
      const slice = allAyahWords.slice(wordIndex, newEnd + 1);
      const phrase = slice.map((w) => w.uthmani).join(' ');
      updateAnnotation({
        endWordIndex: newEnd,
        phraseText: phrase,
        charIndex: undefined,
        charText: undefined
      });
    }
  };

  const handleShrinkWords = () => {
    if (endWordIndex !== undefined && endWordIndex > wordIndex) {
      const newEnd = endWordIndex - 1 <= wordIndex ? undefined : endWordIndex - 1;
      setEndWordIndex(newEnd);
      const phrase = newEnd ? allAyahWords.slice(wordIndex, newEnd + 1).map((w) => w.uthmani).join(' ') : undefined;
      updateAnnotation({
        endWordIndex: newEnd,
        phraseText: phrase
      });
    }
  };

  const handleSelectChar = (charIdx?: number, charText?: string) => {
    setSelectedChar({ index: charIdx, text: charText });
    setEndWordIndex(undefined);
    updateAnnotation({
      charIndex: charIdx,
      charText: charText,
      endWordIndex: undefined,
      phraseText: undefined
    });
  };

  const handleSaveNote = () => {
    updateAnnotation({ note: note.trim() || undefined });
  };

  return (
    <div
      className="absolute bottom-full mb-3 right-1/2 translate-x-1/2 w-80 max-w-[92vw] bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-stone-300/80 p-3.5 z-50 text-stone-900 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >
      {/* Header with Close and designation badge */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-stone-200">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: selectedColor }} />
          <span className="text-[11px] font-bold text-stone-500 shrink-0">المُعيّن:</span>
          <span
            className="font-quran text-sm font-bold truncate px-2 py-0.5 rounded-lg border"
            style={{
              borderColor: `${selectedColor}60`,
              backgroundColor: `${selectedColor}15`,
              color: selectedColor
            }}
            title={designatedText}
          >
            {designatedText}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          title="إغلاق اللوحة"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Link Action Button - Prominent & Top Priority */}
      <button
        onClick={() => {
          onStartConnectionFromWord(wordIndex, designatedText);
          onClose();
        }}
        className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold font-cairo text-xs shadow-md shadow-emerald-900/20 active:scale-98 transition-all"
        title="انقر ثم حدد حرفاً أو كلمة أو آية أخرى لربطها فوراً"
      >
        <Link className="w-4 h-4 text-emerald-200" />
        <span>ربط بحرف أو كلمة أو آية أخرى</span>
      </button>

      {/* Multi-Word Expansion (كلمتين أو أكثر) */}
      <div className="mb-3 bg-stone-50 p-2 rounded-xl border border-stone-200">
        <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-stone-600">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-stone-500" />
            نطاق الكلمات (كلمة أو كلمتين أو أكثر):
          </span>
          <span className="text-emerald-700 font-mono">
            {endWordIndex ? `${endWordIndex - wordIndex + 1} كلمات` : 'كلمة واحدة'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExpandWords}
            disabled={wordIndex >= allAyahWords.length - 1 || (endWordIndex ?? wordIndex) >= allAyahWords.length - 1}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:border-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="ضم الكلمة التالية للتعيين والدائرة"
          >
            <Plus className="w-3 h-3 text-emerald-600" />
            + كلمة تالية
          </button>
          <button
            onClick={handleShrinkWords}
            disabled={!endWordIndex || endWordIndex <= wordIndex}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-rose-50 hover:border-rose-400 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="إنقاص الكلمة الأخيرة من التعيين"
          >
            <Minus className="w-3 h-3 text-rose-600" />
            - إنقاص كلمة
          </button>
        </div>
      </div>

      {/* Letter-level Designation (تعيين الحرف) */}
      <div className="mb-3 bg-stone-50 p-2 rounded-xl border border-stone-200">
        <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-stone-600">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            تعيين حرف دقيق داخل الكلمة:
          </span>
          {selectedChar.text && (
            <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
              حرف [{selectedChar.text}]
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => handleSelectChar(undefined, undefined)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
              selectedChar.index === undefined
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            كُل الكلمة
          </button>
          {letters.map((ltr) => (
            <button
              key={ltr.charIndex}
              onClick={() => handleSelectChar(ltr.charIndex, ltr.displayWithMarks)}
              className={`w-7 h-7 rounded-lg text-xs font-quran font-bold flex items-center justify-center border transition-all ${
                selectedChar.index === ltr.charIndex
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs scale-105'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-emerald-50 hover:border-emerald-400'
              }`}
              title={`تعيين حرف: ${ltr.letter}`}
            >
              {ltr.displayWithMarks}
            </button>
          ))}
        </div>
      </div>

      {/* Distinctive Contrast Color Selection */}
      <div className="mb-3">
        <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
          تمييز بلون مغاير (تباين عالٍ وواضح):
        </span>
        <div className="grid grid-cols-6 gap-1.5">
          {CONTRAST_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => handleColorChange(c.value)}
              className={`h-7 rounded-lg ${c.bg} flex items-center justify-center transition-all shadow-xs ${
                selectedColor === c.value
                  ? `ring-2 ring-offset-2 ${c.ring} scale-105`
                  : 'opacity-85 hover:opacity-100 hover:scale-102'
              }`}
              title={c.name}
            >
              {selectedColor === c.value && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Style Selector: Circle, Highlight, Underline */}
      <div className="flex items-center gap-1 mb-3">
        <button
          onClick={() => handleTypeChange('circle')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            selectedType === 'circle'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
          }`}
          title="دائرة حول التعيين"
        >
          <Circle className="w-3 h-3" />
          دائرة
        </button>

        <button
          onClick={() => handleTypeChange('highlight')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            selectedType === 'highlight'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
          }`}
          title="تظليل لون مميز"
        >
          <Highlighter className="w-3 h-3" />
          تظليل
        </button>

        <button
          onClick={() => handleTypeChange('underline')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            selectedType === 'underline'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
          }`}
          title="تسطير أسفل التعيين"
        >
          <Underline className="w-3 h-3" />
          تسطير
        </button>
      </div>

      {/* Direct Connection from this Word */}
      <button
        onClick={() => {
          onStartConnectionFromWord(wordIndex, designatedText);
          onClose();
        }}
        className="w-full mb-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 py-2 px-3 rounded-xl transition-all shadow-md hover:shadow-lg font-cairo cursor-pointer"
        title="اسحب سهماً رابطاً يبدأ بدقة من هذه الكلمة"
      >
        <Link className="w-3.5 h-3.5" />
        <span>ربط هذه الكلمة بسهم مباشر ↗</span>
      </button>

      {/* Optional Reflection Note Input */}
      {showNoteInput ? (
        <div className="mb-2.5 space-y-1">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSaveNote}
            placeholder="وقفة تدبرية حول هذه الكلمة أو الحرف..."
            className="w-full text-xs p-2 border border-stone-300 rounded-xl outline-none focus:border-emerald-600 bg-stone-50 text-stone-900"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setShowNoteInput(true)}
          className="w-full mb-2.5 flex items-center justify-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors border border-dashed border-stone-300 font-cairo"
        >
          <MessageSquare className="w-3 h-3 text-stone-500" />
          إضافة وقفة أو لطيفة بلاغية
        </button>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-200">
        <button
          onClick={() => {
            onRemoveAnnotation(wordIndex);
            onClose();
          }}
          className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
          title="إلغاء التعيين وإزالة الدائرة"
        >
          <Trash2 className="w-3.5 h-3.5" />
          إلغاء التعيين
        </button>

        <button
          onClick={onClose}
          className="px-4 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
        >
          تم
        </button>
      </div>
    </div>
  );
};

