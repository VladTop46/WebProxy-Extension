function getProxySettings(callback) {
  chrome.storage.sync.get(
    ['proxyType', 'proxyIP', 'proxyPort', 'proxyUsername', 'proxyPassword', 'tunnelMode', 'siteList'], 
    function(result) {
      const proxyType = result.proxyType || 'http';
      const proxyIP = result.proxyIP || '127.0.0.1';
      const proxyPort = result.proxyPort || 8023;
      const proxyUsername = result.proxyUsername || '';
      const proxyPassword = result.proxyPassword || '';
      const tunnelMode = result.tunnelMode || 'none';
      const siteList = result.siteList || [];

      // Определяем схему прокси
      let scheme = proxyType === 'socks5' ? 'socks5' : 'http';

      // Basic proxy settings без туннелирования
      if (tunnelMode === 'none' || siteList.length === 0) {
        const proxySettings = {
          mode: 'fixed_servers',
          rules: {
            singleProxy: {
              scheme: scheme,
              host: proxyIP,
              port: parseInt(proxyPort)
            },
            bypassList: ['<local>']
          }
        };

        // Добавляем аутентификацию если она указана
        if (proxyUsername && proxyPassword) {
          proxySettings.rules.singleProxy.username = proxyUsername;
          proxySettings.rules.singleProxy.password = proxyPassword;
        }

        callback(proxySettings);
        return;
      }

      // Convert domains to safe format
      const safeDomains = siteList.map(domain => {
        domain = domain.toLowerCase().trim();
        if (domain.startsWith('www.')) {
          domain = domain.substring(4);
        }
        return domain;
      });

      // Create PAC script с поддержкой SOCKS5
      const proxyString = scheme === 'socks5' 
        ? `SOCKS5 ${proxyIP}:${proxyPort}` 
        : `PROXY ${proxyIP}:${proxyPort}`;

      const pacScript = `
        function FindProxyForURL(url, host) {
          host = host.toLowerCase();
          if (host.startsWith('www.')) {
            host = host.substring(4);
          }
          
          var domains = '${safeDomains.join(',')}';
          var domainList = domains.split(',');
          var matchFound = false;
          
          for (var i = 0; i < domainList.length; i++) {
            var pattern = domainList[i];
            if (pattern.startsWith('*.')) {
              if (host.endsWith(pattern.slice(2))) {
                matchFound = true;
                break;
              }
            } else if (host === pattern) {
              matchFound = true;
              break;
            }
          }
          
          if ('${tunnelMode}' === 'whitelist') {
            return matchFound ? 'DIRECT' : '${proxyString}';
          } else {
            return matchFound ? '${proxyString}' : 'DIRECT';
          }
        }
      `;

      callback({
        mode: 'pac_script',
        pacScript: {
          data: pacScript
        }
      });
    }
  );
}

// Install listener
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['autoConnect'], function(result) {
    if (result.autoConnect) {
      chrome.storage.sync.set({proxyEnabled: true}, function() {
        getProxySettings(function(settings) {
          chrome.proxy.settings.set(
            {value: settings, scope: 'regular'},
            function() {
              console.log('Proxy enabled on install');
            }
          );
        });
      });
    }
  });
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'enableProxy' || message.type === 'updateProxySettings') {
    getProxySettings(function(settings) {
      chrome.proxy.settings.set(
        {value: settings, scope: 'regular'},
        function() {
          console.log('Proxy settings updated');
          if (sendResponse) sendResponse({success: true});
        }
      );
    });
    return true; // Keep message channel open for async response
  } else if (message.type === 'disableProxy') {
    chrome.proxy.settings.clear(
      {scope: 'regular'},
      function() {
        console.log('Proxy disabled');
        if (sendResponse) sendResponse({success: true});
      }
    );
    return true; // Keep message channel open for async response
  }
});