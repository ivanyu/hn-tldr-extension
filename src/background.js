try {
    // Load `browser-polyfill.js` for Chrome.
    importScripts("browser-polyfill.js");
} catch (e) {
    if (e instanceof ReferenceError) {
        // It's probably Firefox, where `browser-polyfill.js` is provided through `background.scripts`.
        // Do nothing.
    } else {
        throw e;
    }
}

async function onInstalled() {
    const settings = await browser.storage.sync.get('internal.intro_shown');
    if (!settings['internal.intro_shown']) {
        browser.runtime.openOptionsPage();
        await browser.storage.sync.set({ 'internal.intro_shown': true });
    }
}

browser.runtime.onInstalled.addListener(onInstalled);

async function onActionClicked() {
    await browser.runtime.openOptionsPage();
}
browser.action.onClicked.addListener(onActionClicked);

async function summarize(url) {
// return{"summary":["This page is a detailed tutorial about installing Docker natively on an Android phone (specifically a OnePlus 6T) and using it as a home server. The guide walks through the following key steps:\n\n1. Preparing the device by enabling developer mode and USB debugging\n2. Installing Fastboot on a PC\n3. Downloading PostmarketOS files\n4. Entering Fastboot mode\n5. Flashing PostmarketOS onto the phone\n6. Setting up SSH\n7. Installing Docker on the Android phone\n8. Running Docker containers (with Portainer as an example)\n\nThe tutorial provides step-by-step instructions with commands and explanations, highlighting the potential of repurposing an old Android phone as a functional home server. It also notes some limitations, such as relying on Wi-Fi and having limited storage. The author suggests this method can be an alternative to using a Raspberry Pi, with the added benefits of an integrated screen and battery."],"model":"claude-3-5-haiku-20241022","input_tokens":62854,"output_tokens":211}

    var content;
    try {
        const response = await fetch(url);
        content = await response.text();
    } catch (err) {
        throw new Error('Error loading content: ' + err.message);
    }

    try {
        return await getSummary(content);
    } catch (err) {
        throw new Error('Error summarizing content: ' + err.message);
    }
}

async function getSummary(pageContent) {
    const options = await browser.storage.sync.get([
        'anthropic.model',
        'anthropic.api_key',
    ]);
  
    const anthropicApiKey = options['anthropic.api_key'];
    if (!anthropicApiKey) {
        throw new Error('Anthropic API key not found');
    }
    const anthropicModel = options['anthropic.model'] || 'claude-3-5-haiku-20241022';

    const requestContent = [
        {"type": "text", "text": "I want you to summarize the following HTML body:"},
        {"type": "text", "text": pageContent},
        {"type": "text", "text": "Please return only the summary, no other text or comments. Do not call it 'HTML body', but 'page'."},
    ];
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            "model": anthropicModel,
            "max_tokens": 1000,
            "temperature": 0.5,
            "system": "You are a helpful and attentive assistant that summarizes web pages.",
            "messages": [{"role": "user", "content": requestContent}]
        })
    });

    const responseJson = await response.json();
    if (responseJson.type === "error") {
        throw new Error(JSON.stringify(responseJson.error));
    }
  
    const summary = [];
    for (const message of responseJson.content) {
        if (message.type === "text") {
            summary.push(message.text);
        } else {
            summary.push("Unknown message type: " + message.type);
        }
    }
  
    return {
        "summary": summary,
        "model": anthropicModel,
        "input_tokens": responseJson.usage.input_tokens,
        "output_tokens": responseJson.usage.output_tokens
    };
}

browser.runtime.onMessage.addListener(function (message, sender, senderResponse) {
    if (message.type === 'summarize') {
        return summarize(message.url);
    }
});
