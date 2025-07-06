<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  supabase.auth.signOut().then(() => goto('/auth'));
</script>
<p>正在登出...</p> 