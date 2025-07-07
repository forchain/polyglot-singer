<script lang="ts">
  import { onMount } from 'svelte';
  let history = [];
  let grouped = {};
  let loading = true;
  let error = '';

  async function fetchHistory() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/analyze/history');
      const data = await res.json();
      if (data.success) {
        history = data.history;
        // 按歌手分组
        grouped = {};
        for (const item of history) {
          const artist = item.artist || '未知歌手';
          if (!grouped[artist]) grouped[artist] = [];
          grouped[artist].push(item);
        }
      } else {
        error = data.error || '获取历史记录失败';
      }
    } catch (e) {
      error = '网络错误，无法获取历史记录';
    } finally {
      loading = false;
    }
  }

  onMount(fetchHistory);
</script>

<svelte:head>
  <title>My Library - Polyglot Singer</title>
</svelte:head>

<div class="max-w-3xl mx-auto mt-10">
  <h1 class="text-3xl font-bold mb-6">🎵 我的歌词库</h1>
  {#if loading}
    <div>加载中...</div>
  {:else if error}
    <div class="text-red-500">{error}</div>
  {:else if Object.keys(grouped).length === 0}
    <div class="text-gray-500">暂无历史记录</div>
  {:else}
    {#each Object.keys(grouped) as artist}
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-2">{artist}</h2>
        <ul class="space-y-2">
          {#each grouped[artist] as item}
            <li class="p-3 border rounded bg-white flex justify-between items-center">
              <div>
                <div class="font-medium">{item.title || '未命名'}</div>
                <div class="text-xs text-gray-500">{item.createdAt?.slice(0, 10) || ''}</div>
              </div>
              <div class="flex items-center gap-3">
                <a href={`/analyze/history/${item.id}`} class="text-blue-600 hover:underline">查看分析</a>
                <button
                  class="px-2 py-1 rounded text-xs border ml-2 {item.isPublic ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}"
                  on:click={async () => {
                    await fetch(`/api/analyze/history/${item.id}/public`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ isPublic: !item.isPublic })
                    });
                    fetchHistory();
                  }}
                >
                  {item.isPublic ? '已公开' : '未公开'}
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  {/if}
</div> 