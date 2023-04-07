# nanoSSG

Djot.js + Deno + HTMX = :heart:

An opinionated, single script, Deno-based nano-sized SSG using [Djot.js](https://github.com/jgm/djot.js) instead of Markdown.
Outputs file system routable index.html files for pretty URLs and whatever you deign worthy to place in src/static.
Also outputs JSON files to site/static containing metadata about the generated site.
These are intended for consumption by client-side scripts and web components to facilitate dynamic navigation and such.

This project is fit for purpose and will not become a general-purpose JS framework or highly extensible SSG.
If you need either of these on Deno, please see [Fresh](https://fresh.deno.dev) or [Lume](https://lume.land) respectively.

## Usage

1. Clone this repository
2. Add your .djot files to src/
3. Add your static resources to src/static/
4. Customize src/template.html as needed
5. Run `deno task build`
6. Publish contents of site/ to your static website host

## Feature Planning & Progress

- [x] Basic djot-to-html conversion working with minimal config and static resource support
- [x] Pretty URLs with FS routing based on djot file names
- [x] Pretty URLs mirroring subdirectories in src/
- [x] Handle case when configured htmlRootDir does not exist
- [x] Generate a json file containing index of pages in the output static subdirectory
- [x] Add a web component to generate list of page links from pages.json file.
- [x] Add HTMX and begin exploring complementary usage with Djot.
- [ ] Write unit tests around the build script to ease refactoring as it grows.
- [ ] Remove raw HTML file support in favor of exploring Djot only.
- [ ] Add support for HTML fragment file generation from Djot (.djof extension).
- [ ] Expand pages.json schema and add a web component to generate a proper nav menu.
- [ ] Expand nanossg.json (config) schema to support custom extensions and HTML templates.
- [ ] Add a web component for automatic TOC generation based on headings.
- [ ] Add a web component to redirect to a random content page from pages.json.
- [ ] Explicitly define the limits of this project to prevent _too much_ growth.
- [ ] Rewrite example content to produce nanoSSG's own documentation.

## Feature Descriptions

nanoSSG will only ever support Djot for writing content.
It ignores all other files in the configured djotRootDir (src by default).

Djot and Markdown have significant overlap, but I like Djot better.
See its [full syntax references](https://htmlpreview.github.io/?https://github.com/jgm/djot/blob/master/doc/syntax.html) to decide for yourself if its for you.
As it is designed by the creator of Pandoc, your djot content can go _much_ further than nanoSSG.

Only one HTML template is supported for now, with a configurable content replacement token.
Custom template-to-extension mappings may be experimented with for future support.
Djot supports both [raw inline](https://htmlpreview.github.io/?https://github.com/jgm/djot/blob/master/doc/syntax.html#raw-inline) and [raw block](https://htmlpreview.github.io/?https://github.com/jgm/djot/blob/master/doc/syntax.html#raw-block) embeddings, so you can always drop some raw HTML into your djot files if you're feeling frisky.
Use raw block embedding in djot to customize your per-page inclusions.

See the included src directory for examples of the djot file organization scenarios that nanoSSG strives to support.
Every output file is an index.html at a subdirectory path mirroring its src path and file name.
This makes for simplistic pretty URLs via file system routing.
Other cases not covered by existing examples may be supported in the future, but we will strive to keep it simple.
