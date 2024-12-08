try {
    // Load for Chrome.
    importScripts("browser-polyfill.js");
    importScripts("options_const.js");
} catch (e) {
    if (e instanceof ReferenceError) {
        // It's probably Firefox, where necessary scripts are provided through `background.scripts`.
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
        PROVIDER_CONF,
        OPENAI_API_KEY_CONF,
        OPENAI_MODEL_CONF,
        ANTHROPIC_API_KEY_CONF,
        ANTHROPIC_MODEL_CONF,
    ]);

    var url = "";
    const headers = {
        'content-type': 'application/json'
    };
    const requestContent = [
        { "type": "text", "text": "I want you to summarize the following HTML body:" },
        { "type": "text", "text": pageContent },
        { "type": "text", "text": "Please return only the summary, no other text or comments. Do not call it 'HTML body', but 'page'." },
    ];
    const body = {
        "messages": [{ "role": "user", "content": requestContent }],
        "temperature": 0.5
    };

    var model = "";

    const maxTokens = 1000;
    const systemPrompt = "You are a helpful and attentive assistant that summarizes web pages.";

    const provider = options[PROVIDER_CONF] || DEFAULT_PROVIDER;
    switch (provider) {
        case OPENAI_PROVIDER:
            url = 'https://api.openai.com/v1/chat/completions';

            const openaiApiKey = options[OPENAI_API_KEY_CONF];
            if (!openaiApiKey) {
                throw new Error('OpenAI API key not found');
            }
            const openaiModel = options[OPENAI_MODEL_CONF] || DEFAULT_OPENAI_MODEL;

            headers['Authorization'] = 'Bearer ' + openaiApiKey;

            model = openaiModel;
            body['messages'].unshift({ "role": "system", "content": systemPrompt });
            body['max_completion_tokens'] = maxTokens;
            break;

        case ANTHROPIC_PROVIDER:
            url = 'https://api.anthropic.com/v1/messages';

            const anthropicApiKey = options[ANTHROPIC_API_KEY_CONF];
            if (!anthropicApiKey) {
                throw new Error('Anthropic API key not found');
            }
            const anthropicModel = options[ANTHROPIC_MODEL_CONF] || DEFAULT_ANTHROPIC_MODEL;

            headers['x-api-key'] = anthropicApiKey;
            headers['anthropic-version'] = '2023-06-01';
            headers['anthropic-dangerous-direct-browser-access'] = 'true';

            model = anthropicModel;
            body['system'] = systemPrompt;
            body['max_tokens'] = maxTokens;
            break;

        default:
            throw new Error('Unknown provider: ' + options[PROVIDER_CONF]);
    }
    body['model'] = model;

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const responseJson = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(responseJson.error));
    }

    const result = {
        'summary': [],
        'model': model,
        'input_tokens': 0,
        'output_tokens': 0
    };
    switch (provider) {
        case OPENAI_PROVIDER:
            result['summary'].push(responseJson.choices[0].message.content);
            result['input_tokens'] = responseJson.usage.prompt_tokens;
            result['output_tokens'] = responseJson.usage.completion_tokens;
            break;

        case ANTHROPIC_PROVIDER:
            for (const message of responseJson.content) {
                if (message.type === 'text') {
                    result['summary'].push(message.text);
                } else {
                    result['summary'].push('Unknown message type: ' + message.type);
                }
            }
            result['input_tokens'] = responseJson.usage.input_tokens;
            result['output_tokens'] = responseJson.usage.output_tokens;
            break;
    }
    return result;
}

browser.runtime.onMessage.addListener(function (message, sender, senderResponse) {
    if (message.type === 'summarize') {
        return summarize(message.url);
    }
});
