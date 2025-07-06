<script lang="ts">
  export let data;
  const user = data.user;
</script>

{#if user}
  <div class="max-w-lg mx-auto mt-10 p-6 border rounded shadow">
    <h2 class="text-2xl font-bold mb-4">个人信息</h2>
    <div class="mb-2">邮箱：{user.email}</div>
    <div class="mb-2">用户名：{user.username ?? user.display_name ?? user.email}</div>
    <div class="mb-2">注册时间：{user.created_at ?? ''}</div>
  </div>
{:else}
  <div class="text-center text-red-500 mt-10">未获取到用户信息，请重新登录。</div>
{/if} 