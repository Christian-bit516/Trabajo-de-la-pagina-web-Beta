import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://jyjdvrfivabsutboqgyu.supabase.co", // tu URL de proyecto
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5amR2cmZpdmFic3V0Ym9xZ3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTQwMTksImV4cCI6MjA3NjE5MDAxOX0.bVZ8YtLKprWPJElayP8nRlpTULxPeNpPYn6gCqsK3h4" // clave anónima de Supabase
);