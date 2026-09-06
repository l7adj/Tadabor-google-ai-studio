import React, { useMemo } from 'react';
import { tokenizeAyahForHighlight } from '../../lib/arabicUtils';
import { SearchMatchSpan } from '../../types';

export type HighlightColor = 'amber' | 'emerald' | 'rose';

interface HighlightedAyahTextProps {
  textUthmani: string;
  query: string;
  matchedWords?: string[];
  matchedWordIndices?: number[];
  matches?: SearchMatchSpan[];
  mode?: 'exact' | 'root' | 'semantic' | string;
  root?: string;
  matchType?: 'whole' | 'contains' | 'exact';
  exactTashkeel?: boolean;
  highlightColor?: HighlightColor;
  className?: string;
}

export const HighlightedAyahText: React.FC<HighlightedAyahTextProps> = ({
  textUthmani,
  query,
  matchedWords = [],
  matchedWordIndices,
  matches,
  mode,
  root,
  matchType = 'contains',
  exactTashkeel = false,
  highlightColor = 'amber',
  className = ''
}) => {
  const effectiveWordIndices = useMemo(() => {
    if (matchedWordIndices && matchedWordIndices.length > 0) {
      return matchedWordIndices;
    }
    if (matches && matches.length > 0) {
      return matches.map((m) => m.wordIndex);
    }
    return undefined;
  }, [matchedWordIndices, matches]);

  const tokens = useMemo(() => {
    return tokenizeAyahForHighlight(textUthmani, query, {
      mode,
      matchedWords,
      matchedWordIndices: effectiveWordIndices,
      root,
      matchType,
      exactTashkeel
    });
  }, [textUthmani, query, matchedWords, effectiveWordIndices, mode, root, matchType, exactTashkeel]);

  const highlightStyles: Record<HighlightColor, string> = {
    amber: 'bg-amber-100/95 text-amber-900 border border-amber-300/90 shadow-2xs font-bold ring-1 ring-amber-400/30',
    emerald: 'bg-emerald-100/95 text-emerald-900 border border-emerald-300/90 shadow-2xs font-bold ring-1 ring-emerald-400/30',
    rose: 'bg-rose-100/95 text-rose-900 border border-rose-300/90 shadow-2xs font-bold ring-1 ring-rose-400/30'
  };

  return (
    <p
      className={`font-quran text-lg sm:text-2xl text-stone-900 text-right leading-loose select-text ${className}`}
      dir="rtl"
    >
      {tokens.map((token) => {
        if (token.isSign) {
          return (
            <span
              key={token.index}
              className="text-stone-400 text-base sm:text-lg inline-block mx-0.5 select-none font-normal"
            >
              {token.raw}{' '}
            </span>
          );
        }

        if (token.isMatched) {
          return (
            <mark
              key={token.index}
              className={`px-1.5 py-0.5 rounded-lg inline-block mx-0.5 transition-all ${highlightStyles[highlightColor]}`}
            >
              {token.raw}{' '}
            </mark>
          );
        }

        return (
          <span key={token.index} className="text-stone-900">
            {token.raw}{' '}
          </span>
        );
      })}
    </p>
  );
};
