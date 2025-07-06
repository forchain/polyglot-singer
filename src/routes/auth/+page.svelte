<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  let email = 'outliertony@gmail.com';
  let password = '999999999';
  let error = '';
  let message = '';
  let mode: 'login' | 'register' = 'login';

  async function submit() {
    error = '';
    message = '';
    console.log('登录请求:', email, password);
    if (mode === 'register') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) error = err.message;
      else message = '注册成功，请查收邮箱激活！';
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      console.log('登录响应:', data, err);
      if (err) error = err.message;
      else {
        message = '登录成功';
        if (data && data.session) {
          console.log('access_token:', data.session.access_token);
          console.log('refresh_token:', data.session.refresh_token);
          // 手动写 cookie，Path 必须为 /
          document.cookie = `sb-access-token=${data.session.access_token}; path=/`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/`;
          console.log('当前 document.cookie:', document.cookie);
        }
        setTimeout(() => window.location.href = '/library', 500);
      }
    }
  }

  // 页面加载后检测 user 是否为 null，如果是则显示同步失败提示
  $: if (message === '登录成功' && !error) {
    // 等待刷新
  } else if ($page && $page.data && $page.data.user === null && message === '') {
    error = '用户信息同步失败，请联系管理员';
  }
</script>

<div class="max-w-sm mx-auto mt-10 p-6 border rounded shadow">
  <h2 class="text-xl font-bold mb-4">{mode === 'login' ? '登录' : '注册'}</h2>
  <input class="input input-bordered w-full mb-2" type="email" bind:value={email} placeholder="邮箱" />
  <input class="input input-bordered w-full mb-2" type="password" bind:value={password} placeholder="密码" />
  <button class="btn btn-primary w-full mb-2" on:click={submit}>{mode === 'login' ? '登录' : '注册'}</button>
  <button class="btn btn-link w-full" on:click={() => mode = mode === 'login' ? 'register' : 'login'}>
    {mode === 'login' ? '没有账号？注册' : '已有账号？登录'}
  </button>
  {#if error}<div class="text-red-500">{error}</div>{/if}
  {#if message}<div class="text-green-600">{message}</div>{/if}
</div> 