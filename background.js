function getProxySettings(callback) {
  chrome.storage.sync.get(
    ['proxyIP', 'proxyPort', 'tunnelMode', 'siteList'], 
    function(result) {
      const proxyIP = result.proxyIP || '127.0.0.1';
      const proxyPort = result.proxyPort || 8023;
      const tunnelMode = result.tunnelMode || 'none';
      const siteList = result.siteList || [];
      
      // Basic proxy settings
      if (tunnelMode === 'none' || siteList.length === 0) {
        callback({
          mode: 'fixed_servers',
          rules: {
            singleProxy: {
              scheme: 'http',
              host: proxyIP,
              port: parseInt(proxyPort)
            },
            bypassList: ['<local>']
          }
        });
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

      // Create PAC script
      const proxyString = `PROXY ${proxyIP}:${proxyPort}`;
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