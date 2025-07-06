<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  let email = '';
  let password = '';
  let error = '';
  let message = '';
  let mode: 'login' | 'register' = 'login';

  async function submit() {
    error = '';
    message = '';
    if (mode === 'register') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) error = err.message;
      else message = '注册成功，请查收邮箱激活！';
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) error = err.message;
      else {
        message = '登录成功';
        goto('/');
      }
    }
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