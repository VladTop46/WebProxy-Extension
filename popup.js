// Локализация
const translations = {
  ru: {
    title: 'Прокси',
    connect: 'Подключить',
    disconnect: 'Отключить',
    currentIP: 'Текущий IP:',
    loading: 'Загрузка...',
    settings: 'Настройки',
    proxyIP: 'IP адрес прокси',
    proxyPort: 'Порт прокси',
    proxyType: 'Тип прокси',
    proxyUsername: 'Имя пользователя (опционально)',
    proxyPassword: 'Пароль (опционально)',
    tunnelMode: 'Режим туннелирования',
    none: 'Отключен',
    whitelist: 'Белый список',
    blacklist: 'Черный список',
    siteList: 'Список сайтов (по одному в строке)',
    autoConnect: 'Автоподключение при запуске',
    save: 'Сохранить',
    back: 'Назад',
    connected: 'Подключено',
    disconnected: 'Отключено',
    statusWhitelist: 'Режим белого списка',
    statusBlacklist: 'Режим черного списка',
    settingsSaved: 'Настройки сохранены',
    enterIP: 'Введите IP прокси',
    enterPort: 'Введите порт',
    domainExample: 'example.com',
    language: 'Язык:',
    exportSites: 'Экспортировать',
    importSites: 'Импортировать',
    emptyList: 'Список пуст!'
  },
  en: {
    title: 'Proxy Extension',
    connect: 'Connect',
    disconnect: 'Disconnect',
    currentIP: 'Current IP:',
    loading: 'Loading...',
    settings: 'Settings',
    proxyIP: 'Proxy IP Address',
    proxyPort: 'Proxy Port',
    proxyType: 'Proxy Type',
    proxyUsername: 'Username (optional)',
    proxyPassword: 'Password (optional)',
    tunnelMode: 'Split Tunneling Mode',
    none: 'None',
    whitelist: 'Whitelist Mode',
    blacklist: 'Blacklist Mode',
    siteList: 'Site List (one domain per line)',
    autoConnect: 'Auto-connect on browser start',
    save: 'Save Settings',
    back: 'Back',
    connected: 'Connected',
    disconnected: 'Disconnected',
    statusWhitelist: 'Whitelist Mode',
    statusBlacklist: 'Blacklist Mode',
    settingsSaved: 'Settings saved',
    enterIP: 'Enter proxy IP',
    enterPort: 'Enter proxy port',
    domainExample: 'example.com',
    language: 'Language:',
    exportSites: 'Export Sites',
    importSites: 'Import Sites',
    emptyList: 'List is empty!'
  }
};

let currentLang = 'ru';

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  // Загрузим язык и тему
  chrome.storage.sync.get(['language', 'theme'], function(result) {
    if (result.language) {
      currentLang = result.language;
    }
    const theme = result.theme || 'light';
    applyTheme(theme);
    loadIcons();
    updateLanguage(currentLang);
    initializeUI();
  });
});

function loadIcons() {
  loadSvgIcon('toggle-theme', 'icons/frontend/sun.svg');
  loadSvgIcon('open-settings', 'icons/frontend/settings.svg');
  loadSvgIcon('back-button-top', 'icons/frontend/arrow-left.svg');
}

function loadSvgIcon(elementId, svgPath) {
  const element = document.getElementById(elementId);
  if (!element) return;

  fetch(chrome.runtime.getURL(svgPath))
    .then(response => {
      if (!response.ok) throw new Error('SVG not found');
      return response.text();
    })
    .then(svgContent => {
      element.innerHTML = svgContent;
      // Устанавливаем атрибуты для SVG
      const svg = element.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 24 24');
      }
    })
    .catch(err => {
      console.warn(`Failed to load icon ${svgPath}:`, err);
      // Fallback: используем встроенный SVG
      loadFallbackIcon(elementId);
    });
}

function loadFallbackIcon(elementId) {
  const fallbacks = {
    'toggle-theme': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    'open-settings': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"/><path d="M1 12h6m6 0h6"/><path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/></svg>',
    'back-button-top': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>'
  };
  
  const element = document.getElementById(elementId);
  if (element && fallbacks[elementId]) {
    element.innerHTML = fallbacks[elementId];
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('toggle-theme');
  if (themeBtn) {
    themeBtn.setAttribute('data-theme', theme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  chrome.storage.sync.set({theme: newTheme});
}

function initializeUI() {
  // Обработчики событий
  document.getElementById('toggle-proxy').addEventListener('click', toggleProxy);
  document.getElementById('open-settings').addEventListener('click', openSettings);
  document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
  document.getElementById('back-button').addEventListener('click', goBack);
  document.getElementById('back-button-top').addEventListener('click', goBack);
  document.getElementById('settings-form').addEventListener('submit', saveSettings);
  document.getElementById('export-sites').addEventListener('click', exportSites);
  document.getElementById('import-sites').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', importSites);

  // Обработчики кнопок языка
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.dataset.lang;
      chrome.storage.sync.set({language: lang}, function() {
        currentLang = lang;
        updateLanguage(lang);
      });
    });
  });

  // Инициализация состояния
  chrome.storage.sync.get(['proxyEnabled'], function(result) {
    updateProxyState(result.proxyEnabled || false);
  });

  // Обновляем IP каждые 5 секунд
  fetchCurrentIP();
  setInterval(fetchCurrentIP, 5000);
}

function updateLanguage(lang) {
  const t = translations[lang];
  
  // Обновляем активную кнопку языка
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Обновляем все тексты
  document.querySelector('.title').textContent = t.title;
  const toggleBtn = document.getElementById('toggle-proxy');
  toggleBtn.textContent = toggleBtn.textContent.includes('Disconnect') || toggleBtn.textContent === t.disconnect ? t.disconnect : t.connect;
  
  // Обновляем текст IP
  const ipElement = document.querySelector('#current-ip');
  const ipLabel = document.querySelector('.ip-label');
  ipLabel.textContent = t.currentIP;
  
  if (ipElement.textContent === 'Loading...' || ipElement.textContent === t.loading) {
    ipElement.textContent = t.loading;
  }

  // Обновляем заголовки в настройках
  document.querySelector('#settings-section h2').textContent = t.settings;
  
  // Обновляем labels в форме
  const labels = {
    'proxy-type': t.proxyType,
    'proxy-ip': t.proxyIP,
    'proxy-port': t.proxyPort,
    'proxy-username': t.proxyUsername,
    'proxy-password': t.proxyPassword,
    'mode-none': t.none,
    'mode-whitelist': t.whitelist,
    'mode-blacklist': t.blacklist,
    'site-list': t.siteList,
    'auto-connect': t.autoConnect
  };

  for (const [id, text] of Object.entries(labels)) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label && id !== 'auto-connect') {
      label.textContent = text;
    }
  }

  // Обновляем placeholder'ы
  document.getElementById('proxy-ip').placeholder = t.enterIP;
  document.getElementById('proxy-port').placeholder = t.enterPort;
  document.getElementById('site-list').placeholder = t.domainExample;

  // Обновляем кнопки
  document.querySelector('button[type="submit"]').textContent = t.save;
  document.getElementById('back-button').textContent = t.back;

  // Обновляем чекбокс лейбл
  const autoConnectLabel = document.querySelector('label[for="auto-connect"]');
  if (autoConnectLabel) {
    autoConnectLabel.textContent = t.autoConnect;
  }

  // Обновляем языкой лейбл
  const langLabel = document.querySelector('.language-select label');
  if (langLabel) {
    langLabel.textContent = t.language;
  }

  updateStatus();
}

function updateStatus() {
  chrome.storage.sync.get(['proxyEnabled', 'tunnelMode'], function(result) {
    const statusElement = document.getElementById('connection-status');
    const statusIndicator = document.querySelector('.status-indicator');
    const t = translations[currentLang];
    
    let status = result.proxyEnabled ? t.connected : t.disconnected;
    if (result.proxyEnabled && result.tunnelMode !== 'none') {
      status += ' • ' + (result.tunnelMode === 'whitelist' ? t.statusWhitelist : t.statusBlacklist);
    }
    
    statusElement.textContent = status;
    
    // Обновляем индикатор
    if (statusIndicator) {
      statusIndicator.classList.toggle('connected', result.proxyEnabled);
      statusIndicator.classList.toggle('disconnected', !result.proxyEnabled);
    }
  });
}

function toggleProxy() {
  chrome.storage.sync.get(['proxyEnabled'], function(result) {
    const newState = !result.proxyEnabled;
    chrome.storage.sync.set({proxyEnabled: newState}, function() {
      updateProxyState(newState);
    });
  });
}

function updateProxyState(enabled) {
  const t = translations[currentLang];
  const buttonElement = document.getElementById('toggle-proxy');

  if (enabled) {
    chrome.runtime.sendMessage({type: 'enableProxy'}, function(response) {
      if (chrome.runtime.lastError) {
        console.log('Error enabling proxy:', chrome.runtime.lastError);
      }
    });
    buttonElement.textContent = t.disconnect;
  } else {
    chrome.runtime.sendMessage({type: 'disableProxy'}, function(response) {
      if (chrome.runtime.lastError) {
        console.log('Error disabling proxy:', chrome.runtime.lastError);
      }
    });
    buttonElement.textContent = t.connect;
  }

  setTimeout(fetchCurrentIP, 500);
  updateStatus();
}

function openSettings() {
  document.getElementById('main-section').classList.add('hidden');
  document.getElementById('settings-section').classList.remove('hidden');
  restoreSettings();
}

function goBack() {
  document.getElementById('settings-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
}

function saveSettings(event) {
  event.preventDefault();

  const proxyType = document.getElementById('proxy-type').value;
  const proxyIP = document.getElementById('proxy-ip').value;
  const proxyPort = document.getElementById('proxy-port').value;
  const proxyUsername = document.getElementById('proxy-username').value;
  const proxyPassword = document.getElementById('proxy-password').value;
  const autoConnect = document.getElementById('auto-connect').checked;
  const tunnelMode = document.querySelector('input[name="tunnel-mode"]:checked').value;
  const siteList = document.getElementById('site-list').value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  chrome.storage.sync.set({
    proxyType: proxyType,
    proxyIP: proxyIP,
    proxyPort: proxyPort,
    proxyUsername: proxyUsername,
    proxyPassword: proxyPassword,
    autoConnect: autoConnect,
    tunnelMode: tunnelMode,
    siteList: siteList
  }, function() {
    chrome.runtime.sendMessage({type: 'updateProxySettings'}, function(response) {
      const t = translations[currentLang];
      alert(t.settingsSaved);
    });
  });
}

function restoreSettings() {
  chrome.storage.sync.get(
    ['proxyType', 'proxyIP', 'proxyPort', 'proxyUsername', 'proxyPassword', 'autoConnect', 'tunnelMode', 'siteList'], 
    function(result) {
      document.getElementById('proxy-type').value = result.proxyType || 'http';
      document.getElementById('proxy-ip').value = result.proxyIP || '';
      document.getElementById('proxy-port').value = result.proxyPort || '';
      document.getElementById('proxy-username').value = result.proxyUsername || '';
      document.getElementById('proxy-password').value = result.proxyPassword || '';
      document.getElementById('auto-connect').checked = result.autoConnect || false;
      
      const mode = result.tunnelMode || 'none';
      document.querySelector(`input[name="tunnel-mode"][value="${mode}"]`).checked = true;
      
      document.getElementById('site-list').value = (result.siteList || []).join('\n');
    }
  );
}

function fetchCurrentIP() {
  const ipElement = document.getElementById('current-ip');
  
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      ipElement.textContent = data.ip;
    })
    .catch(() => {
      ipElement.textContent = 'Error';
    });
}

function exportSites() {
  const siteList = document.getElementById('site-list').value;
  const t = translations[currentLang];
  
  if (!siteList.trim()) {
    alert(t.emptyList);
    return;
  }

  // Создаем blob с содержимым
  const blob = new Blob([siteList], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  
  // Создаем ссылку для загрузки
  const link = document.createElement('a');
  link.href = url;
  link.download = `proxy-sites-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importSites(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const textarea = document.getElementById('site-list');
    
    // Если уже есть текст, добавляем с новой строки
    if (textarea.value.trim()) {
      textarea.value += '\n' + content;
    } else {
      textarea.value = content;
    }
  };
  reader.readAsText(file);
  
  // Очищаем input для возможности повторной загрузки
  event.target.value = '';
}