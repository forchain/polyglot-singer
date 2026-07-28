<script lang="ts">
  import { goto } from '$app/navigation';
  fetch('/api/auth/logout', { method: 'POST' }).finally(() => goto('/auth'));
</script>
<p>正在登出...</p> 
