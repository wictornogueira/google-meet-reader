// Check for updates
(async function() {
  try {
    const updateElement = document.getElementById('update');

    const response = await fetch('https://api.github.com/repos/wictornogueira/google-meet-reader/releases/latest');
    const { tag_name } = await response.json();
    const { version } = chrome.runtime.getManifest();

    if (tag_name !== version) {
      const warning = document.createElement('div');
      warning.className = 'alert alert-warning';
      warning.innerText = 'Uma nova versão está disponível no github.';

      updateElement.appendChild(warning);
    }
  } catch {}
})();

// Main stuff
(function() {
  const prefixElement = document.getElementById('prefix');
  const enableElement = document.getElementById('enable');
  
  chrome.storage.local.get(['g_meet_tts_prefix', 'g_meet_tts_enabled'], values => {
    const { g_meet_tts_prefix, g_meet_tts_enabled } = values;
    
    enableElement.checked = g_meet_tts_enabled || false;
    prefixElement.value = g_meet_tts_prefix || '';
    
    prefixElement.onchange = e => {
      chrome.storage.local.set({ g_meet_tts_prefix: e.target.value });
    }
    
    enableElement.onchange = e => {
      chrome.storage.local.set({ g_meet_tts_enabled: e.target.checked });
    }
  });
})();
