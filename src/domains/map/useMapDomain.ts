import React, { useState, useEffect, useCallback } from 'react';
import { TadabburMap, CanvasNode, CanvasEdge } from '../../types';
import { MindMapTemplate } from '../../lib/mindMapTemplates';
import { validateImportedMap } from './mapValidator';
import {
  getStoredMaps,
  getActiveMapId,
  setActiveMapId,
  STARTER_MAPS
} from '../../lib/storage';

export interface UseMapDomainProps {
  onNotify?: (message: string) => void;
}

export function useMapDomain({ onNotify }: UseMapDomainProps = {}) {
  const [maps, setMaps] = useState<TadabburMap[]>(() => getStoredMaps());
  const [activeMapId, setActiveMapIdState] = useState<string>(() => getActiveMapId());

  // Derive current active map safely
  const currentMap = maps.find((m) => m.id === activeMapId) || maps[0] || STARTER_MAPS[0];

  useEffect(() => {
    setActiveMapId(activeMapId);
  }, [activeMapId]);

  const selectMap = useCallback((mapId: string) => {
    setActiveMapIdState(mapId);
  }, []);

  const createMap = useCallback(() => {
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

    setMaps((prev) => [newMap, ...prev]);
    setActiveMapIdState(newMap.id);
    onNotify?.('تم إنشاء خريطة تدبّر جديدة');
    return newMap;
  }, [maps.length, onNotify]);

  const deleteMap = useCallback((mapId: string) => {
    setMaps((prev) => {
      if (prev.length <= 1) {
        alert('لا يمكن حذف الخريطة الوحيدة المتبقية');
        return prev;
      }
      const filtered = prev.filter((m) => m.id !== mapId);
      if (activeMapId === mapId) {
        setActiveMapIdState(filtered[0].id);
      }
      onNotify?.('تم حذف الخريطة');
      return filtered;
    });
  }, [activeMapId, onNotify]);

  const updateMapTitle = useCallback((title: string) => {
    setMaps((prev) =>
      prev.map((m) => (m.id === currentMap.id ? { ...m, title, updatedAt: Date.now() } : m))
    );
  }, [currentMap.id]);

  const updateMap = useCallback((updatedMap: TadabburMap) => {
    setMaps((prev) => prev.map((m) => (m.id === updatedMap.id ? updatedMap : m)));
  }, []);

  const applyTemplate = useCallback((template: MindMapTemplate, asNewMap: boolean) => {
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
      setMaps((prev) => [newMap, ...prev]);
      setActiveMapIdState(newMap.id);
      onNotify?.(`تم إنشاء خريطة جديدة بهيكل: ${template.title}`);
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
      updateMap(updatedMap);
      onNotify?.(`تمت إضافة هيكل: ${template.title} إلى اللوحة الحالية`);
    }
  }, [currentMap, updateMap, onNotify]);

  const exportMap = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentMap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentMap.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify?.('تم تحميل ملف الخريطة بنجاح');
  }, [currentMap, onNotify]);

  const importMap = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        const result = validateImportedMap(raw);
        if (!result.isValid || !result.map) {
          onNotify?.(result.error || 'الملف المرفق ليس بصيغة خريطة تدبرية صالحة');
          return;
        }
        const imported = result.map;
        setMaps((prev) => [imported, ...prev]);
        setActiveMapIdState(imported.id);
        onNotify?.(`تم استيراد خريطة "${imported.title}" بنجاح`);
      } catch (err) {
        onNotify?.('حدث خطأ أثناء قراءة الملف. يرجى التأكد من اختيار ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [onNotify]);

  return {
    maps,
    activeMapId,
    currentMap,
    selectMap,
    createMap,
    deleteMap,
    updateMapTitle,
    updateMap,
    applyTemplate,
    exportMap,
    importMap
  };
}
