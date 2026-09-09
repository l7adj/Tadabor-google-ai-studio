import { useCallback } from 'react';
import { TadabburMap, CanvasNode, SearchResultItem, QuranAnchor, WordAnnotation } from '../../types';
import { cleanSurahName } from '../../lib/arabicUtils';

export interface UseSearchCanvasIntegrationProps {
  currentMap: TadabburMap;
  onUpdateMap: (updatedMap: TadabburMap) => void;
  onNotify?: (message: string) => void;
}

export function useSearchCanvasIntegration({
  currentMap,
  onUpdateMap,
  onNotify
}: UseSearchCanvasIntegrationProps) {
  const addAyahToCanvas = useCallback(
    (item: SearchResultItem, anchor?: QuranAnchor) => {
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

      onUpdateMap(updatedMap);

      if (anchor && anchor.level === 'word') {
        onNotify?.(`تمت إضافة آية مع ارتكاز على كلمة «${anchor.text}»`);
      } else {
        onNotify?.(`تمت إضافة سورة ${cleanSurahName(item.surahName)} [آية ${item.ayahNumberInSurah}] إلى الخريطة`);
      }
    },
    [currentMap, onUpdateMap, onNotify]
  );

  const addQuickAyahs = useCallback(
    (items: SearchResultItem[], anchor?: QuranAnchor) => {
      if (!items || items.length === 0) return;
      if (items.length === 1 && anchor) {
        addAyahToCanvas(items[0], anchor);
      } else {
        items.forEach((item) => addAyahToCanvas(item));
      }
    },
    [addAyahToCanvas]
  );

  return {
    addAyahToCanvas,
    addQuickAyahs
  };
}
