function getProxySettings(callback) {
    chrome.storage.sync.get(['proxyIP', 'proxyPort'], function(result) {
      const proxyIP = result.proxyIP || '127.0.0.1';
      const proxyPort = result.proxyPort || 8023;
      const PROXY_SETTINGS = {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: 'http',
            host: proxyIP,
            port: parseInt(proxyPort)
          },
          bypassList: ['<local>']
        }
      };
      callback(PROXY_SETTINGS);
    });
  }
  
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['autoConnect'], function(result) {
      if (result.autoConnect) {
        chrome.storage.sync.set({proxyEnabled: true}, function() {
          chrome.runtime.sendMessage({type: 'enableProxy'});
        });
      }
    });
  });
  
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'enableProxy') {
      getProxySettings(function(PROXY_SETTINGS) {
        chrome.proxy.settings.set({value: PROXY_SETTINGS, scope: 'regular'}, () => {
          console.log('Proxy enabled');
        });
      });
    } else if (message.type === 'disableProxy') {
      chrome.proxy.settings.clear({}, () => {
        console.log('Proxy disabled');
      });
    }
  });
  