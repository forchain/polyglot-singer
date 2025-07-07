export function restoreLyricAnalysis(
  originalLines: string[],
  compressedLines: any[]
) {
  // uniqueLines 顺序与 compressedLines 一致
  const uniqueLines: string[] = [];
  const lineToUniqueIdx: Record<string, number> = {};
  originalLines.forEach(line => {
    if (!(line in lineToUniqueIdx)) {
      lineToUniqueIdx[line] = uniqueLines.length;
      uniqueLines.push(line);
    }
  });

  // 还原
  return originalLines.map((line, idx) => {
    const uniqueIdx = lineToUniqueIdx[line];
    const [lineTranslation, wordsArr] = compressedLines[uniqueIdx];
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