import { useCallback } from 'react';
import {
  TadabburMap,
  CanvasNode,
  CanvasEdge,
  SearchResultItem,
  QuranAnchor,
  WordAnnotation,
  CreateReflectionPayload
} from '../../types';
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

  const addReflectionToCanvas = useCallback(
    (payload: CreateReflectionPayload) => {
      // Find or create ayah node
      const existingAyah = currentMap.nodes.find(
        (n) =>
          n.type === 'ayah' &&
          n.ayahData?.surahNumber === payload.surahNumber &&
          n.ayahData?.ayahNumberInSurah === payload.ayahNumberInSurah
      );

      let ayahNode = existingAyah;
      const newNodes = [...currentMap.nodes];

      if (!ayahNode) {
        let newX = 140;
        let newY = 140;
        if (newNodes.length > 0) {
          const lastNode = newNodes[newNodes.length - 1];
          newX = lastNode.x + 30;
          newY = lastNode.y + 160;
          if (newY > 750) {
            newY = 120;
            newX = lastNode.x + 400;
          }
        }

        ayahNode = {
          id: `ayah-${payload.surahNumber}-${payload.ayahNumberInSurah}-${Date.now()}`,
          type: 'ayah',
          x: newX,
          y: newY,
          width: 380,
          colorTheme: 'emerald',
          ayahData: {
            surahNumber: payload.surahNumber,
            surahName: cleanSurahName(payload.surahName),
            ayahNumberInSurah: payload.ayahNumberInSurah,
            overallAyahNumber: 0,
            juz: 1,
            revelationType: 'Meccan',
            textUthmani: payload.textUthmani,
            textSimple: payload.textSimple || payload.textUthmani,
            annotations: []
          }
        };
        newNodes.push(ayahNode);
      }

      let determinedLevel: QuranAnchor['level'] = 'ayah';
      if (payload.level) {
        determinedLevel = payload.level;
      } else if (payload.startChar !== undefined || payload.charIndex !== undefined) {
        determinedLevel = payload.endChar !== undefined && payload.endChar !== (payload.startChar ?? payload.charIndex) ? 'char_range' : 'char';
      } else if (payload.endWord !== undefined && payload.startWord !== undefined && payload.endWord !== payload.startWord) {
        determinedLevel = 'word_range';
      } else if (payload.wordIndex !== undefined || payload.startWord !== undefined) {
        determinedLevel = 'word';
      }

      const anchor: QuranAnchor = payload.anchor
        ? payload.anchor
        : {
            surah: payload.surahNumber,
            ayah: payload.ayahNumberInSurah,
            level: determinedLevel,
            wordIndex: payload.wordIndex ?? payload.startWord,
            startWord: payload.startWord ?? payload.wordIndex,
            endWord: payload.endWord ?? payload.wordIndex,
            charIndex: payload.charIndex ?? payload.startChar,
            startChar: payload.startChar ?? payload.charIndex,
            endChar: payload.endChar ?? payload.charIndex,
            text: payload.selectedText || payload.textUthmani,
            surahName: cleanSurahName(payload.surahName),
            ayahNumberInSurah: payload.ayahNumberInSurah
          };

      // Create reflection card placed next to the ayah
      const reflectionNode: CanvasNode = {
        id: `reflection-${Date.now()}`,
        type: 'reflection',
        x: ayahNode.x + (ayahNode.width || 380) + 40,
        y: ayahNode.y,
        width: 380,
        colorTheme: 'emerald',
        reflectionData: {
          title: payload.title,
          surahName: cleanSurahName(payload.surahName),
          ayahNumberInSurah: payload.ayahNumberInSurah,
          observation: payload.observation,
          question: payload.question,
          insight: payload.insight,
          tags: payload.tags,
          anchor,
          selectedText: payload.selectedText || payload.textUthmani,
          createdAt: Date.now()
        }
      };
      newNodes.push(reflectionNode);

      // Connect ayah to reflection
      const newEdge: CanvasEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: ayahNode.id,
        targetId: reflectionNode.id,
        sourceHandle: 'left' as const,
        targetHandle: 'right' as const,
        relationshipKind: 'tadabbur' as const,
        label: 'وقفة تدبرية',
        sourceWordIndex: anchor.wordIndex ?? anchor.startWord,
        sourceWordText: payload.selectedText,
        sourceAnchor: anchor,
        style: 'solid' as const,
        curveType: 'bezier' as const,
        arrowType: 'end' as const,
        color: '#059669'
      };

      const updatedMap: TadabburMap = {
        ...currentMap,
        nodes: newNodes,
        edges: [...currentMap.edges, newEdge],
        updatedAt: Date.now()
      };

      onUpdateMap(updatedMap);
      onNotify?.(`تمت إضافة وقفة تدبرية وربطها بسورة ${cleanSurahName(payload.surahName)} [آية ${payload.ayahNumberInSurah}]`);
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
    addReflectionToCanvas,
    addQuickAyahs
  };
}
