# DjotSSG

An opinionated Deno-based nano-SSG using [Djot.js](https://github.com/jgm/djot.js) instead of Markdown.

## Usage

1. Clone this repository.
2. Add your .djot files to src/.
3. Add your static resource to src/static/.
4. Customize src/template.html as needed.
5. Run `deno task build`.
6. Publish contents of site/ to your static website host.

## Features

- [x] Basic djot-to-html conversion working with minimal config and static resource support
- [x] Pretty URLs with FS routing based on djot file names
- [x] Pretty URLs mirroring subdirectories in src/
- [x] Handle case when configured htmlRootDir does not exist
- [ ] Generate a json file containing index of pages in the output static subdirectory
