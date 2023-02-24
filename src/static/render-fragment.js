class RenderFragment extends HTMLElement {
    fragmentHref
    
    constructor() {
        super();

        if (this.hasAttribute('href')) {
            this.fragmentHref = this.getAttribute('href');
        }
    }

    connectedCallback() {
        this.render();
    }

    async render() {
        const res = await fetch(this.fragmentHref, {headers: {'Content-Type': 'text/html'}});
        const html = await res.text();
        this.setHTML(html);
    }
}

window.customElements.define('render-fragment', RenderFragment);
