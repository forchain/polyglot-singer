export function restoreLyricAnalysis(
  originalLines: string[],
  compressedLines: any[]
) {
  if (originalLines.length > compressedLines.length) {
    // 去掉compressedLines的最后一行，然后删除originalLines后面几行
    compressedLines = compressedLines.slice(0, -1);
    const targetLength = compressedLines.length;
    originalLines = originalLines.slice(0, targetLength);
  }
  // 直接一一对应，不查重
  return originalLines.map((line, idx) => {
    const arr = compressedLines[idx];
    if (!Array.isArray(arr) || arr.length < 2) {
      console.error('[restoreLyricAnalysis] Invalid compressed line:', arr, 'at idx:', idx);
      throw new Error('Invalid compressed line format');
    }
    const [lineTranslation, wordsArrRaw] = arr;
    const wordsArr = Array.isArray(wordsArrRaw) ? wordsArrRaw : [];
    return {
      lineNumber: idx + 1,
      originalLine: line,
      lineTranslation,
      words: wordsArr.map(([word, phonetic, translation]: [string, string, string]) => ({
        word, phonetic, translation
      }))
    };
  });
} 