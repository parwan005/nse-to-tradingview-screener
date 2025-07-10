const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.type = "text/javascript";
document.documentElement.appendChild(script);

const style = document.createElement("link");
style.rel = "stylesheet";
style.href = chrome.runtime.getURL("style.css");
document.head.appendChild(style);

