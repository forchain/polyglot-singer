import { restoreLyricAnalysis } from './restoreLyricAnalysis';

describe('restoreLyricAnalysis', () => {
  it('能正确还原有重复歌词的分析结果', () => {
    const originalLines = [
      'hello world',
      'foo bar',
      'hello world',
      'baz qux',
      'foo bar'
    ];

    // uniqueLines = ['hello world', 'foo bar', 'baz qux']
    const compressedLines = [
      // hello world
      [
        '你好，世界',
        [
          ['hello', '/həˈloʊ/', '你好'],
          ['world', '/wɜːrld/', '世界']
        ]
      ],
      // foo bar
      [
        '示例翻译',
        [
          ['foo', '/fuː/', '示例'],
          ['bar', '/bɑːr/', '条']
        ]
      ],
      // baz qux
      [
        '测试翻译',
        [
          ['baz', '/bæz/', '测试'],
          ['qux', '/kwʌks/', '翻译']
        ]
      ]
    ];

    const expected = [
      {
        lineNumber: 1,
        originalLine: 'hello world',
        lineTranslation: '你好，世界',
        words: [
          { word: 'hello', phonetic: '/həˈloʊ/', translation: '你好' },
          { word: 'world', phonetic: '/wɜːrld/', translation: '世界' }
        ]
      },
      {
        lineNumber: 2,
        originalLine: 'foo bar',
        lineTranslation: '示例翻译',
        words: [
          { word: 'foo', phonetic: '/fuː/', translation: '示例' },
          { word: 'bar', phonetic: '/bɑːr/', translation: '条' }
        ]
      },
      {
        lineNumber: 3,
        originalLine: 'hello world',
        lineTranslation: '你好，世界',
        words: [
          { word: 'hello', phonetic: '/həˈloʊ/', translation: '你好' },
          { word: 'world', phonetic: '/wɜːrld/', translation: '世界' }
        ]
      },
      {
        lineNumber: 4,
        originalLine: 'baz qux',
        lineTranslation: '测试翻译',
        words: [
          { word: 'baz', phonetic: '/bæz/', translation: '测试' },
          { word: 'qux', phonetic: '/kwʌks/', translation: '翻译' }
        ]
      },
      {
        lineNumber: 5,
        originalLine: 'foo bar',
        lineTranslation: '示例翻译',
        words: [
          { word: 'foo', phonetic: '/fuː/', translation: '示例' },
          { word: 'bar', phonetic: '/bɑːr/', translation: '条' }
        ]
      }
    ];

    const result = restoreLyricAnalysis(originalLines, compressedLines);
    expect(result).toEqual(expected);
  });
}); 