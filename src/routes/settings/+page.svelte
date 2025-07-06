<script lang="ts">
import { onMount } from 'svelte';

// 支持的语言列表
const LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: '英语' },
  { code: 'ja', name: '日语' },
  { code: 'fr', name: '法语' },
  { code: 'es', name: '西班牙语' },
  { code: 'de', name: '德语' },
  { code: 'ko', name: '韩语' },
  { code: 'it', name: '意大利语' },
  { code: 'pt', name: '葡萄牙语' },
  { code: 'ru', name: '俄语' }
];

let voices: SpeechSynthesisVoice[] = [];
let defaultVoices: Record<string, string> = {};
let saveMessage = '';

onMount(async () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    voices = window.speechSynthesis.getVoices();
    // 兼容部分浏览器异步加载 voices
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
    };
  }
  // 优先从后端获取
  try {
    const res = await fetch('/api/user/preferences');
    const data = await res.json();
    if (data.success && data.preferences && data.preferences.defaultVoices) {
      defaultVoices = JSON.parse(data.preferences.defaultVoices);
    } else {
      // fallback 本地
      const saved = localStorage.getItem('defaultVoices');
      if (saved) {
        defaultVoices = JSON.parse(saved);
      }
    }
  } catch {
    // fallback 本地
    const saved = localStorage.getItem('defaultVoices');
    if (saved) {
      defaultVoices = JSON.parse(saved);
    }
  }
});

function handleVoiceChange(lang, event) {
  defaultVoices = { ...defaultVoices, [lang]: event.target.value };
}

async function saveSettings() {
  localStorage.setItem('defaultVoices', JSON.stringify(defaultVoices));
  // 同步保存到后端
  await fetch('/api/user/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ defaultVoices: JSON.stringify(defaultVoices) })
  });
  saveMessage = '已保存！';
  setTimeout(() => (saveMessage = ''), 1500);
}
</script>

<div class="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
  <h2 class="text-2xl font-bold mb-6">全局发音设置</h2>
  <form on:submit|preventDefault={saveSettings}>
    <table class="w-full mb-4">
      <thead>
        <tr>
          <th class="text-left py-2">语言</th>
          <th class="text-left py-2">默认发音 Voice</th>
        </tr>
      </thead>
      <tbody>
        {#each LANGUAGES as lang}
          <tr>
            <td class="py-2">{lang.name} ({lang.code})</td>
            <td class="py-2">
              <select
                bind:value={defaultVoices[lang.code]}
                on:change={e => handleVoiceChange(lang.code, e)}
                class="border rounded px-2 py-1 w-full"
                id={`voice-${lang.code}`}
              >
                <option value="">（系统默认）</option>
                {#each voices.filter(v => v.lang.startsWith(lang.code)) as v}
                  <option value={v.voiceURI}>{v.name} ({v.lang})</option>
                {/each}
              </select>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button type="submit" class="btn-primary px-6 py-2">保存设置</button>
    {#if saveMessage}
      <span class="ml-4 text-green-600">{saveMessage}</span>
    {/if}
  </form>
</div> 