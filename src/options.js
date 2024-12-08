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
    ]);

    const provider = options[PROVIDER_CONF] || DEFAULT_PROVIDER;
    if (provider === OPENAI_PROVIDER) {
        document.querySelector("#provider-openai").checked = true;
    } else if (provider === ANTHROPIC_PROVIDER) {
        document.querySelector("#provider-anthropic").checked = true;
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
}

document.addEventListener('DOMContentLoaded', loadOptions);

document.addEventListener('DOMContentLoaded', function () {
    const openaiProviderRadio = document.getElementById('provider-openai');
    openaiProviderRadio.addEventListener('change', async (event) => {
        await saveOption(event, PROVIDER_CONF, OPENAI_PROVIDER);
    });
    const anthropicProviderRadio = document.getElementById('provider-anthropic');
    anthropicProviderRadio.addEventListener('change', async (event) => {
        await saveOption(event, PROVIDER_CONF, ANTHROPIC_PROVIDER);
    });

    const openaiApiKeyInput = document.getElementById('openai-api-key');
    openaiApiKeyInput.addEventListener('blur', async (event) => {
        await saveOption(event, OPENAI_API_KEY_CONF, event.target.value);
    });

    const openaiModelSelect = document.getElementById('openai-model');
    openaiModelSelect.addEventListener('change', async (event) => {
        await saveOption(event, OPENAI_MODEL_CONF, event.target.value);
    });

    const anthropicApiKeyInput = document.getElementById('anthropic-api-key');
    anthropicApiKeyInput.addEventListener('blur', async (event) => {
        await saveOption(event, ANTHROPIC_API_KEY_CONF, event.target.value);
    });

    const anthropicModelSelect = document.getElementById('anthropic-model');
    anthropicModelSelect.addEventListener('change', async (event) => {
        await saveOption(event, ANTHROPIC_MODEL_CONF, event.target.value);
    });
});
