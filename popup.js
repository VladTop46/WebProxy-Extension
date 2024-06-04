document.getElementById('toggle-proxy').addEventListener('click', toggleProxy);
document.getElementById('open-settings').addEventListener('click', openSettings);
document.getElementById('back-button').addEventListener('click', goBack);
document.getElementById('settings-form').addEventListener('submit', saveSettings);

function toggleProxy() {
  chrome.storage.sync.get(['proxyEnabled'], function(result) {
    const newState = !result.proxyEnabled;
    chrome.storage.sync.set({proxyEnabled: newState}, function() {
      updateProxyState(newState);
    });
  });
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

  chrome.storage.sync.set({
    proxyIP: proxyIP,
    proxyPort: proxyPort,
    autoConnect: autoConnect
  }, function() {
    alert('Settings saved');
  });
}

function restoreSettings() {
  chrome.storage.sync.get(['proxyIP', 'proxyPort', 'autoConnect'], function(result) {
    document.getElementById('proxy-ip').value = result.proxyIP || '';
    document.getElementById('proxy-port').value = result.proxyPort || '';
    document.getElementById('auto-connect').checked = result.autoConnect || false;
  });
}

function updateProxyState(enabled) {
    const statusElement = document.getElementById('connection-status');
    const buttonElement = document.getElementById('toggle-proxy');
    const iconPath = enabled ? 'icons/connected_icon' : 'icons/icon';
    const title = enabled ? `Proxy Extension (Connected)` : 'Proxy Extension (Disconnected)';
  
    if (enabled) {
      chrome.runtime.sendMessage({type: 'enableProxy'});
      statusElement.textContent = 'Connected to Proxy';
      buttonElement.textContent = 'Disconnect from Proxy';
    } else {
      chrome.runtime.sendMessage({type: 'disableProxy'});
      statusElement.textContent = 'Disconnected';
      buttonElement.textContent = 'Connect to Proxy';
    }
  
    // Обновляем иконку и заголовок
    chrome.action.setIcon({ path: {
      "16": iconPath + "16.png",
      "48": iconPath + "48.png",
      "128": iconPath + "128.png"
    }});

    setTimeout(fetchCurrentIP, 500);
    chrome.action.setTitle({ title: title });
  }

function fetchCurrentIP() {
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      document.getElementById('current-ip').textContent = data.ip;
    })
    .catch(() => {
      document.getElementById('current-ip').textContent = 'Unable to fetch IP';
    });
}

chrome.storage.sync.get(['proxyEnabled'], function(result) {
  updateProxyState(result.proxyEnabled || false);
  fetchCurrentIP();
});
