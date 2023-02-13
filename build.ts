import djot from "npm:@djot/djot";
import config from "./config.json" assert {type: "json"};
import {walk, WalkEntry, copy, ensureDir} from "https://deno.land/std@0.177.0/fs/mod.ts";
import {join, dirname, normalize} from "https://deno.land/std@0.177.0/path/mod.ts";

const pageList: Array<string> = [];
const htmlTemplate = await Deno.readTextFile(config.htmlTemplateFile);
await empty_html_root_dir();
await copy_static_dir();
await walk_djot_files_and_output_html();

async function walk_djot_files_and_output_html() {
    for await (const djotFile of walk(config.djotRootDir, {
        includeDirs: false,
        exts: ['.djot']
    })) {
        const finalHtml = await transform_djot_to_html(djotFile);
        const outFile = calculate_output_file_path(djotFile);
        await ensureDir(dirname(outFile));
        await Deno.writeTextFile(outFile, finalHtml);
        const pagePath = dirname(outFile).replace(config.htmlRootDir, '');
        pageList.push(pagePath);
    }
}

await write_json(pageList);

async function write_json(pages: Array<string>) {
    const outFile = join(config.htmlRootDir, 'static', 'pages.json');
    const outJson = JSON.stringify(pages);

    try {
        await Deno.writeTextFile(outFile, outJson);
    } catch {
        console.log('Error writing pages.json, continuing.')
    }
}

async function empty_html_root_dir() {
    try {
        await Deno.remove(config.htmlRootDir, {recursive: true});
    } catch {
        console.log('Configured htmlRootDir does not appear to exist, it will be created.');
    } finally {
        await ensureDir(config.htmlRootDir);
    }
}

async function copy_static_dir() {
    await copy(
        join(config.djotRootDir, 'static'),
        join(config.htmlRootDir, 'static'),
        {overwrite: true});
}

async function transform_djot_to_html(djotFile: WalkEntry) {
    const djotContent = await Deno.readTextFile(djotFile.path);
    const ast = djot.parse(djotContent, {sourcePositions: false});
    const html = djot.renderHTML(ast);
    const final = htmlTemplate.replace(config.htmlContentToken, html);
    return final;
}

function calculate_output_file_path(djotFile: WalkEntry) {
    let outFile = djotFile.path.replace(config.djotRootDir, config.htmlRootDir);

    if (djotFile.name == 'index.djot') {
        outFile = outFile.replace('.djot', '.html');
    }
    else {
        outFile = outFile.replace('.djot', '');
        outFile = join(outFile, 'index.html');
    }

    return outFile;
}
