async function saveOption(e, name, value) {
    e.preventDefault();
    const toSave = {};
    toSave[name] = value;
    try {
        await browser.storage.sync.set(toSave);
    } catch (e) {
        alert("Error saving option: " + JSON.stringify(e));
    }
}

async function loadOptions() {
    const options = await browser.storage.sync.get([
        PROVIDER_CONF,
        OPENAI_API_KEY_CONF,
        OPENAI_MODEL_CONF,
        ANTHROPIC_API_KEY_CONF,
        ANTHROPIC_MODEL_CONF,
        OLLAMA_MODEL_CONF,
        OLLAMA_URL_CONF,
    ]);

    const provider = options[PROVIDER_CONF] || DEFAULT_PROVIDER;
    if (provider === OPENAI_PROVIDER) {
        document.querySelector("#provider-openai").checked = true;
    } else if (provider === ANTHROPIC_PROVIDER) {
        document.querySelector("#provider-anthropic").checked = true;
    } else if (provider === OLLAMA_PROVIDER) {
        document.querySelector("#provider-ollama").checked = true;
    }

    const openaiApiKey = options[OPENAI_API_KEY_CONF];
    if (openaiApiKey) {
        document.querySelector("#openai-api-key").value = openaiApiKey;
    }

    const openaiModel = options[OPENAI_MODEL_CONF] || DEFAULT_OPENAI_MODEL;
    document.querySelector("#openai-model").value = openaiModel;

    const anthropicApiKey = options[ANTHROPIC_API_KEY_CONF];
    if (anthropicApiKey) {
        document.querySelector("#anthropic-api-key").value = anthropicApiKey;
    }

    const anthropicModel = options[ANTHROPIC_MODEL_CONF] || DEFAULT_ANTHROPIC_MODEL;
    document.querySelector("#anthropic-model").value = anthropicModel;

    const ollamaUrl = options[OLLAMA_URL_CONF];
    if (ollamaUrl) {
        document.querySelector("#ollama-url").value = ollamaUrl;
    }
    const ollamaModel = options[OLLAMA_MODEL_CONF];
    if (ollamaModel) {
        document.querySelector("#ollama-model").value = ollamaModel;
    }
}

document.addEventListener('DOMContentLoaded', loadOptions);

document.addEventListener('DOMContentLoaded', function () {
    function createChangeListener(confName) {
        return async (event) => {
            await saveOption(event, confName, event.target.value);
        }
    }

    // OpenAI
    document.getElementById('provider-openai')
        .addEventListener('change', createChangeListener(PROVIDER_CONF));
    document.getElementById('openai-api-key')
        .addEventListener('blur', createChangeListener(OPENAI_API_KEY_CONF));
    document.getElementById('openai-model')
        .addEventListener('change', createChangeListener(OPENAI_MODEL_CONF));


    // Anthropic
    document.getElementById('provider-anthropic')
        .addEventListener('change', createChangeListener(PROVIDER_CONF));
    document.getElementById('anthropic-api-key')
        .addEventListener('blur', createChangeListener(ANTHROPIC_API_KEY_CONF));
    document.getElementById('anthropic-model')
        .addEventListener('change', createChangeListener(ANTHROPIC_MODEL_CONF));


    // Ollama
    document.getElementById('provider-ollama')
        .addEventListener('change', createChangeListener(PROVIDER_CONF));
    document.getElementById('ollama-url')
        .addEventListener('blur', createChangeListener(OLLAMA_URL_CONF));
    document.getElementById('ollama-model')
        .addEventListener('blur', createChangeListener(OLLAMA_MODEL_CONF));
});
