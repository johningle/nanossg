class PageList extends HTMLElement {
    dataSrc = "/static/pages.json";

    constructor() {
        super();

        if (this.hasAttribute('src')) {
            this.dataSrc = this.getAttribute('src');
        }
    }

    connectedCallback() {        
        this.render();
    }

    async render() {
        try {
            const pages = await (await fetch(this.dataSrc)).json();

            for (const page in pages) {
                const anchor = document.createElement('a');
                anchor.setAttribute('href', pages[page] ? pages[page] : '/');
                anchor.innerText = page;
                this.appendChild(anchor);
                this.appendChild(document.createElement('br'));
            }
        } catch (ex) {
            console.log('Error rendering page list.', ex);
        }
    }
}

window.customElements.define('page-list', PageList);
