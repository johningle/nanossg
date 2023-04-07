import config from "./nanossg.json" assert {type: "json"};
import {parse, renderHTML} from "npm:@djot/djot";
import {walk, copy, ensureDir, type WalkEntry} from "https://deno.land/std@0.177.0/fs/mod.ts";
import {join, dirname, basename} from "https://deno.land/std@0.177.0/path/mod.ts";

const pageList: Record<string,string> = {};

await empty_html_root_dir(Deno.remove, config);
await copy_static_dir_to_html_root_dir(config);
await walk_djot_files_and_output_html(pageList, Deno.readTextFile, config);
await write_json(pageList, Deno.writeTextFile, config);
await copy_raw_html_to_root_dir(config);

type ReadTextFile = (path: string | URL, options?: Deno.ReadFileOptions | undefined) => Promise<string>;
type WriteTextFile = (path: string | URL, data: string | ReadableStream<string>, options?: Deno.WriteFileOptions | undefined) => Promise<void>;
type RemoveDir = (path: string | URL, options?: Deno.RemoveOptions | undefined) => Promise<void>;

async function walk_djot_files_and_output_html(pageList: Record<string,string>, readTextFile: ReadTextFile, config: IConfig) {
    const htmlTemplate = await Deno.readTextFile(config.htmlTemplateFile);
    for await (const djotFile of walk(config.djotRootDir, {
        includeDirs: false,
        exts: ['.djot']
    })) {
        const finalHtml = await transform_djot_to_html(djotFile, htmlTemplate, readTextFile, config);
        const outFile = calculate_output_file_path(djotFile, config);
        await ensureDir(dirname(outFile));
        await Deno.writeTextFile(outFile, finalHtml);
        const pagePath = dirname(outFile).replace(config.htmlRootDir, '');
        add_to_page_list(pageList, pagePath);
    }
}

function add_to_page_list(pageList: Record<string,string>, pagePath: string) {
    let pageName = basename(pagePath);
    if (pageName == 'index.html') { pageName = basename(dirname(pagePath)); }    
    let pageKey = pagePath.replaceAll('-', ' ', );
    if (!(pageKey in pageList)) { pageKey = pageName.replaceAll('-', ' ', ); }
    if (pageKey == '') { pageKey = 'index'; }
    pageList[pageKey] = pagePath;
}

async function write_json(pages: Record<string,string>, writeTextFile: WriteTextFile, config: IConfig) {
    const outFile = join(config.htmlRootDir, 'static', 'pages.json');
    const outJson = JSON.stringify(pages, null, 4);

    try {
        await writeTextFile(outFile, outJson);
    } catch (ex) {
        console.log('Error writing pages.json, printing error and continuing.');
        console.log(ex);
    }
}

async function empty_html_root_dir(remove: RemoveDir, config: IConfig) {
    try {
        await remove(config.htmlRootDir, {recursive: true});
    } catch {
        console.log('Configured htmlRootDir does not appear to exist, it will be created.');
    } finally {
        await ensureDir(config.htmlRootDir);
    }
}

async function copy_static_dir_to_html_root_dir(config: IConfig) {
    await copy(
        join(config.djotRootDir, 'static'),
        join(config.htmlRootDir, 'static'),
        {overwrite: true});
}

async function copy_raw_html_to_root_dir(config: IConfig) {
    for await (const htmlFile of walk(config.djotRootDir, {
        includeDirs: false,
        exts: ['.html']
    })) {
        if (htmlFile.path != config.htmlTemplateFile) {
            const outputPath = htmlFile.path.replace(config.djotRootDir, config.htmlRootDir);
            await copy(htmlFile.path, outputPath, {overwrite: true});
        }
    }
}

async function transform_djot_to_html(djotFile: WalkEntry, htmlTemplate: string, readTextFile: ReadTextFile, config: IConfig) {
    const djotContent = await readTextFile(djotFile.path);
    const ast = parse(djotContent, {sourcePositions: false});
    const html = renderHTML(ast);
    const final = htmlTemplate.replace(config.htmlContentToken, html);
    return final;
}

function calculate_output_file_path(djotFile: WalkEntry, config: IConfig) {
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

interface IConfig {
    djotRootDir: string,
    htmlRootDir: string,
    htmlTemplateFile: string,
    htmlContentToken: string
}

export {
    empty_html_root_dir,
    copy_static_dir_to_html_root_dir,
    walk_djot_files_and_output_html,
    write_json,
    copy_raw_html_to_root_dir
}

export type {
    IConfig,
    ReadTextFile,
    WriteTextFile,
    RemoveDir
}
