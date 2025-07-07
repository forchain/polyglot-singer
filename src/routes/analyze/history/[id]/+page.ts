import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch, parent }) => {
  const { id } = params;
  // 获取分析数据
  const res = await fetch(`/api/analyze/history/${id}`);
  const data = await res.json();
  if (!data.success) {
    throw error(404, '未找到歌词分析');
  }
  // 获取用户 voice 偏好
  let selectedVoice = '';
  try {
    const prefRes = await fetch('/api/user/preferences');
    const prefData = await prefRes.json();
    if (prefData.success && prefData.preferences && prefData.preferences.defaultVoices) {
      const defaultVoices = JSON.parse(prefData.preferences.defaultVoices);
      if (data.analysis && data.analysis.sourceLanguage && defaultVoices[data.analysis.sourceLanguage]) {
        selectedVoice = defaultVoices[data.analysis.sourceLanguage];
      }
    }
  } catch {}
  return {
    analysis: data.analysis,
    selectedVoice,
    isPublic: data.isPublic
  };
}; 