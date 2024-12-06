class Control {
    constructor(summarizeA) {
        this.summarizeA = summarizeA;

        summarizeA.href = "#";
        summarizeA.id = `btn-summarize-${counter++}`;
        summarizeA.addEventListener('click', this.onClick.bind(this));

        this.inProgress = false;
        this.stopAnimation = () => {};

        this.summaryTd = null;

        this.summaryExist = false;
        this.summaryShown = false;
        this.render();
    }

    async onClick(e) {
        e.preventDefault();

        if (this.inProgress) {
            return;
        }

        if (this.summaryExist) {
            this.summaryShown = !this.summaryShown;
            this.render();
            return; 
        }

        this.inProgress = true;
        this.startAnimation();
    
        const url = e.target.parentElement.parentElement.parentElement.previousElementSibling
            .getElementsByClassName('titleline')[0].querySelector('a').href;
        this.createSummaryTrIfNeeded();

        try {
            const summary = await browser.runtime.sendMessage({ type: 'summarize', url: url });
            this.success(summary);
        } catch (e) {
            this.error(e);
        } finally {
            this.inProgress = false;
            this.stopAnimation();
            this.render();
     }
    }

    success(summary) {
        this.summaryTd.innerHTML = '';
        var isFirstParagraph = true;
        for (const line of summary.summary) {
            for (const paragraph of line.split('\n')) {
                const p = document.createElement('p');
                p.textContent = paragraph;

                p.style.margin = isFirstParagraph ? '0px' : '0.5em 0';
                isFirstParagraph = false;

                this.summaryTd.appendChild(p);
            }
        }

        const p = document.createElement('p');
        p.style.fontSize = '0.6em';
        p.style.fontStyle = 'italic';
        // p.style.textAlign = 'right';
        p.textContent = `Model: ${summary.model}, input tokens: ${summary.input_tokens}, output tokens: ${summary.output_tokens}`;
        this.summaryTd.appendChild(p);

        this.summaryExist = true;
        this.summaryShown = true;
    }

    error(e) {
        this.summaryTd.innerHTML = '';
        const p = document.createElement('p');
        p.style.margin = '0px';
        p.textContent = e.message;
        this.summaryTd.appendChild(p);
    }

    startAnimation() {
        var dots = "";
        const animationInterval = setInterval(() => {
            if (dots === "...") {
                dots = "";
            } else {
                dots += ".";
            }
    
            this.summarizeA.textContent = "summarizing" + dots;
        }, 300);
        this.stopAnimation = () => {
            clearInterval(animationInterval);
            this.stopAnimation = () => {};
        };
    }

    createSummaryTrIfNeeded() {
        if (this.summaryTd) {
            return;
        }

        const lastTrInBlock = this.summarizeA.parentElement.parentElement.parentElement.nextElementSibling;
        const summaryTr = document.createElement('tr');
        lastTrInBlock.insertAdjacentElement('afterend', summaryTr);
    
        const colspanTd = document.createElement('td');
        colspanTd.setAttribute('colspan', '2');
        summaryTr.appendChild(colspanTd);

        this.summaryTd = document.createElement('td');
        summaryTr.appendChild(this.summaryTd);
    }

    render() {
        if (this.summaryExist) {
            if (this.summaryShown) {
                this.summarizeA.textContent = "hide summary";
                if (this.summaryTd) {
                    this.summaryTd.style.display = '';
                }
            } else {
                this.summarizeA.textContent = "show summary";
                if (this.summaryTd) {
                    this.summaryTd.style.display = 'none';
                }
            }
        } else {
            this.summarizeA.textContent = "summarize";
        }
    }
}

const sublines = document.getElementsByClassName('subline');
var counter = 0;
for (const subline of sublines) {
    const as = subline.getElementsByTagName("a");
    const lastA = as[as.length - 1];

    const summarizeA = document.createElement('a');
    lastA.insertAdjacentElement('beforebegin', summarizeA);
    const control = new Control(summarizeA);

    lastA.insertAdjacentText('beforebegin', ' | ');
}
