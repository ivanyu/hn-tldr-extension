const ANTHROPIC_API_KEY_CONF = 'anthropic.api_key';
const ANTHROPIC_MODEL_CONF = 'anthropic.model';

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
        ANTHROPIC_API_KEY_CONF,
        ANTHROPIC_MODEL_CONF,
    ]);

    const anthropicApiKey = options[ANTHROPIC_API_KEY_CONF];
    if (anthropicApiKey) {
        document.querySelector("#anthropic-api-key").value = anthropicApiKey;
    }

    const anthropicModel = options[ANTHROPIC_MODEL_CONF] || 'claude-3-5-haiku-20241022';
    document.querySelector("#anthropic-model").value = anthropicModel;
}

document.addEventListener('DOMContentLoaded', loadOptions);

document.addEventListener('DOMContentLoaded', function () {
    const apiKeyInput = document.getElementById('anthropic-api-key');
    apiKeyInput.addEventListener('blur', async (event) => {
        await saveOption(event, ANTHROPIC_API_KEY_CONF, event.target.value);
    });

    const modelSelect = document.getElementById('anthropic-model');
    modelSelect.addEventListener('change', async (event) => {
        await saveOption(event, ANTHROPIC_MODEL_CONF, event.target.value);
    });
});
