// Локализация
const translations = {
  ru: {
    title: '\u041F\u0440\u043E\u043A\u0441\u0438',
    connect: '\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C',
    disconnect: '\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C',
    currentIP: '\u0422\u0435\u043A\u0443\u0449\u0438\u0439 IP:',
    loading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...',
    settings: '\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438',
    proxyIP: 'IP \u0430\u0434\u0440\u0435\u0441 \u043F\u0440\u043E\u043A\u0441\u0438',
    proxyPort: '\u041F\u043E\u0440\u0442 \u043F\u0440\u043E\u043A\u0441\u0438',
    tunnelMode: '\u0420\u0435\u0436\u0438\u043C \u0442\u0443\u043D\u043D\u0435\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F',
    none: '\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D',
    whitelist: '\u0411\u0435\u043B\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A',
    blacklist: '\u0427\u0435\u0440\u043D\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A',
    siteList: '\u0421\u043F\u0438\u0441\u043E\u043A \u0441\u0430\u0439\u0442\u043E\u0432 (\u043F\u043E \u043E\u0434\u043D\u043E\u043C\u0443 \u0432 \u0441\u0442\u0440\u043E\u043A\u0435)',
    autoConnect: '\u0410\u0432\u0442\u043E\u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043F\u0440\u0438 \u0437\u0430\u043F\u0443\u0441\u043A\u0435',
    save: '\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C',
    back: '\u041D\u0430\u0437\u0430\u0434',
    connected: '\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043E',
    disconnected: '\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E',
    statusWhitelist: '\u0420\u0435\u0436\u0438\u043C \u0431\u0435\u043B\u043E\u0433\u043E \u0441\u043F\u0438\u0441\u043A\u0430',
    statusBlacklist: '\u0420\u0435\u0436\u0438\u043C \u0447\u0435\u0440\u043D\u043E\u0433\u043E \u0441\u043F\u0438\u0441\u043A\u0430',
    settingsSaved: '\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B',
    enterIP: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 IP \u043F\u0440\u043E\u043A\u0441\u0438',
    enterPort: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u043E\u0440\u0442',
    domainExample: 'example.com'
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
    domainExample: 'example.com'
  }
};

let currentLang = 'ru'; // По умолчанию русский

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['language'], function(result) {
    if (result.language) {
      currentLang = result.language;
    }
    updateLanguage(currentLang);
    initializeUI();
  });
});

function initializeUI() {
  // Обработчики событий
  document.getElementById('toggle-proxy').addEventListener('click', toggleProxy);
  document.getElementById('open-settings').addEventListener('click', openSettings);
  document.getElementById('back-button').addEventListener('click', goBack);
  document.getElementById('settings-form').addEventListener('submit', saveSettings);

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
  toggleBtn.textContent = toggleBtn.textContent.includes('Disconnect') ? t.disconnect : t.connect;
  
  // Обновляем текст IP
  const ipElement = document.querySelector('#current-ip');
  ipElement.previousSibling.textContent = t.currentIP + ' ';
  if (ipElement.textContent === 'Loading...') {
    ipElement.textContent = t.loading;
  }

  // Обновляем заголовки в настройках
  document.querySelector('#settings-section h2').textContent = t.settings;
  
  // Обновляем тексты в форме настроек
  const labels = {
    'proxy-ip': t.proxyIP,
    'proxy-port': t.proxyPort,
    'mode-none': t.none,
    'mode-whitelist': t.whitelist,
    'mode-blacklist': t.blacklist,
    'site-list': t.siteList,
    'auto-connect': t.autoConnect
  };

  for (const [id, text] of Object.entries(labels)) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = text;
  }

  // Обновляем placeholder'ы
  document.getElementById('proxy-ip').placeholder = t.enterIP;
  document.getElementById('proxy-port').placeholder = t.enterPort;
  document.getElementById('site-list').placeholder = t.domainExample;

  // Обновляем кнопки
  document.querySelector('button[type="submit"]').textContent = t.save;
  document.getElementById('back-button').textContent = t.back;

  updateStatus();
}

function updateStatus() {
  chrome.storage.sync.get(['proxyEnabled', 'tunnelMode'], function(result) {
    const statusElement = document.getElementById('connection-status');
    const t = translations[currentLang];
    
    let status = result.proxyEnabled ? t.connected : t.disconnected;
    if (result.proxyEnabled && result.tunnelMode !== 'none') {
      status += ' • ' + (result.tunnelMode === 'whitelist' ? t.statusWhitelist : t.statusBlacklist);
    }
    
    statusElement.textContent = status;
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
  const statusElement = document.getElementById('connection-status');
  const buttonElement = document.getElementById('toggle-proxy');
  const iconPath = enabled ? 'icons/connected_icon' : 'icons/icon';
  const title = enabled ? `${t.title} (${t.connected})` : `${t.title} (${t.disconnected})`;

  if (enabled) {
    chrome.runtime.sendMessage({type: 'enableProxy'}, function(response) {
      if (chrome.runtime.lastError) {
        console.log('Error enabling proxy:', chrome.runtime.lastError);
      }
    });
    buttonElement.style.background = 'linear-gradient(145deg, #28a745, #1e7e34)';
    buttonElement.textContent = t.disconnect;
  } else {
    chrome.runtime.sendMessage({type: 'disableProxy'}, function(response) {
      if (chrome.runtime.lastError) {
        console.log('Error disabling proxy:', chrome.runtime.lastError);
      }
    });
    buttonElement.style.background = 'linear-gradient(145deg, #007bff, #0056b3)';
    buttonElement.textContent = t.connect;
  }

  chrome.action.setIcon({ path: {
    "16": iconPath + "16.png",
    "48": iconPath + "48.png",
    "128": iconPath + "128.png"
  }});

  setTimeout(fetchCurrentIP, 500);
  chrome.action.setTitle({ title: title });
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

  const proxyIP = document.getElementById('proxy-ip').value;
  const proxyPort = document.getElementById('proxy-port').value;
  const autoConnect = document.getElementById('auto-connect').checked;
  const tunnelMode = document.querySelector('input[name="tunnel-mode"]:checked').value;
  const siteList = document.getElementById('site-list').value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  chrome.storage.sync.set({
    proxyIP: proxyIP,
    proxyPort: proxyPort,
    autoConnect: autoConnect,
    tunnelMode: tunnelMode,
    siteList: siteList
  }, function() {
    chrome.runtime.sendMessage({type: 'updateProxySettings'}, function(response) {
      if (chrome.runtime.lastError) {
        console.log('Error updating settings:', chrome.runtime.lastError);
        alert(translations[currentLang].settingsSaved);
      } else {
        alert(translations[currentLang].settingsSaved);
      }
    });
  });
}

function restoreSettings() {
  chrome.storage.sync.get(
    ['proxyIP', 'proxyPort', 'autoConnect', 'tunnelMode', 'siteList'], 
    function(result) {
      document.getElementById('proxy-ip').value = result.proxyIP || '';
      document.getElementById('proxy-port').value = result.proxyPort || '';
      document.getElementById('auto-connect').checked = result.autoConnect || false;
      
      const mode = result.tunnelMode || 'none';
      document.querySelector(`input[name="tunnel-mode"][value="${mode}"]`).checked = true;
      
      document.getElementById('site-list').value = (result.siteList || []).join('\n');
    }
  );
}

function fetchCurrentIP() {
  const ipElement = document.getElementById('current-ip');
  ipElement.textContent = translations[currentLang].loading;
  
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      ipElement.textContent = data.ip;
    })
    .catch(() => {
      ipElement.textContent = 'Error';
    });
}