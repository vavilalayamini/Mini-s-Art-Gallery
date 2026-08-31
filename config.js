// Mini's Art Gallery store settings.
// Replace the placeholder values before publishing the store.
window.MINI_CONFIG = {
  upiId: "YOUR-UPI-ID@bank",
  upiName: "Mini's Art Gallery",
  shippingFlatRate: 99,
  freeShippingThreshold: 2500,
  // Paste your Supabase project URL and anon key here after setup.
  supabaseUrl: "",
  supabaseAnonKey: ""
};

if (window.MINI_CONFIG.supabaseUrl && window.MINI_CONFIG.supabaseAnonKey) {
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  s.onload = () => {
    window.supabaseClient = window.supabase.createClient(
      window.MINI_CONFIG.supabaseUrl,
      window.MINI_CONFIG.supabaseAnonKey
    );
  };
  document.head.appendChild(s);
}
