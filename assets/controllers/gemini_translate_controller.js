import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['loader'];

    connect() {
        this.running = false;
    }

    async translate() {
        if (this.running) {
            return;
        }
        this.running = true;
        this.showLoader();

        try {
            await this.requestTranslation();
        } finally {
            this.hideLoader();
            this.running = false;
        }
    }

    async requestTranslation() {
        const sourceBody = this.element.closest('.accordion-body');
        if (!sourceBody) {
            return;
        }

        const parentAccordion = sourceBody.closest('.accordion');
        if (!parentAccordion) {
            return;
        }

        const targetBodies = Array.from(parentAccordion.querySelectorAll('.accordion-body')).filter(function(b) {
            return b !== sourceBody;
        });

        for (let i = 0; i < targetBodies.length; i++) {
            const body = targetBodies[i];
            const emptyInputs = Array.from(body.querySelectorAll('textarea, input[type="text"]')).filter(function(inp) {
                return !inp.value || inp.value.trim() === '';
            });

            for (let j = 0; j < emptyInputs.length; j++) {
                const targetInput = emptyInputs[j];
                const sourceInput = this.findMatchingSource(sourceBody, targetInput);

                if (!sourceInput || !sourceInput.value.trim()) {
                    continue;
                }

                const sourceText = sourceInput.value.trim();
                const targetLocale = this.extractLocale(targetInput);
                const prompt = this.buildPrompt(sourceText, targetLocale);
                const result = await this.ask(prompt);

                if (!result) {
                    continue;
                }

                targetInput.value = this.extractResult(result);
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    // Find the source input that corresponds to the same field key as targetInput
    // e.g. target name="...[translations][fr_FR][name]"  ->  source name="...[translations][en_US][name]"
    findMatchingSource(sourceBody, targetInput) {
        var suffix = '';

        if (targetInput.name) {
            // Extract last bracket group: [name], [description] etc.
            var match = targetInput.name.match(/\[translations\]\[[^\]]+\](\[[^\]]+\])$/);
            if (match) {
                suffix = match[1];
            }
        }

        if (suffix) {
            // Find source input with same suffix ending
            var selector = 'textarea[name$="' + this.escapeSelector(suffix) + '"], input[name$="' + this.escapeSelector(suffix) + '"]';
            var found = sourceBody.querySelector(selector);
            if (found) {
                return found;
            }
        }

        // Fallback: match by index (position) within the accordion body
        var allSource = sourceBody.querySelectorAll('textarea, input[type="text"]');
        var allTarget = targetInput.closest('.accordion-body').querySelectorAll('textarea, input[type="text"]');
        var idx = Array.from(allTarget).indexOf(targetInput);

        return allSource[idx] || null;
    }

    escapeSelector(str) {
        return str.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    }

    showLoader() {
        if (this.hasLoaderTarget) {
            this.loaderTarget.classList.remove('d-none');
        }
    }

    hideLoader() {
        if (this.hasLoaderTarget) {
            this.loaderTarget.classList.add('d-none');
        }
    }

    extractLocale(input) {
        if (input.name) {
            const match = input.name.match(/\[translations\]\[([^\]]+)\]/);
            if (match) {
                return match[1].replace('_', '-');
            }
        }
        return '';
    }

    buildPrompt(text, targetLocale) {
        const target = targetLocale ? ' into ' + targetLocale : '';
        return 'Translate the following text' + target + '. Return only the translated text:\n\n' + text;
    }

    async ask(prompt) {
        const languageModel = window.LanguageModel || (self.ai && self.ai.languageModel) || null;

        if (languageModel && languageModel.create) {
            const session = await languageModel.create();
            const result = await session.prompt(prompt);
            if (session.destroy) {
                session.destroy();
            }
            return result;
        }

        if (languageModel && languageModel.prompt) {
            return languageModel.prompt(prompt);
        }

        if (window.chrome && window.chrome.ai && window.chrome.ai.ask) {
            return window.chrome.ai.ask(prompt);
        }

        alert('Chrome Prompt API is not available.');
        return null;
    }

    extractResult(result) {
        if (typeof result === 'string') {
            return result.trim();
        }
        if (result && result.text) {
            return result.text.trim();
        }
        if (result && result.content) {
            return result.content.trim();
        }
        return String(result).trim();
    }
}
