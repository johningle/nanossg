import * as depsProd from "./deps.ts";

let deps = depsProd;
const pageList: any = {};
const htmlTemplate = await Deno.readTextFile(deps.config.htmlTemplateFile);
await empty_html_root_dir();
await copy_static_dir_to_html_root_dir();
await walk_djot_files_and_output_html();
await write_json(pageList);

async function walk_djot_files_and_output_html() {
    for await (const djotFile of deps.walk(deps.config.djotRootDir, {
        includeDirs: false,
        exts: ['.djot']
    })) {
        const finalHtml = await transform_djot_to_html(djotFile);
        const outFile = calculate_output_file_path(djotFile);
        await deps.ensureDir(deps.dirname(outFile));
        await Deno.writeTextFile(outFile, finalHtml);
        const pagePath = deps.dirname(outFile).replace(deps.config.htmlRootDir, '');
        add_to_page_list(pagePath);
    }
}

function add_to_page_list(pagePath: string) {
    let pageName = deps.basename(pagePath);
    if (pageName == 'index.html') { pageName = deps.basename(deps.dirname(pagePath)); }    
    let pageKey = pagePath.replaceAll('-', ' ', );
    if (!(pageKey in pageList)) { pageKey = pageName.replaceAll('-', ' ', ); }
    if (pageKey == '') { pageKey = 'index'; }
    pageList[pageKey] = pagePath;
}

async function write_json(pages: any) {
    const outFile = deps.join(deps.config.htmlRootDir, 'static', 'pages.json');
    const outJson = JSON.stringify(pages, null, 4);

    try {
        await Deno.writeTextFile(outFile, outJson);
    } catch {
        console.log('Error writing pages.json, continuing.')
    }
}

async function empty_html_root_dir() {
    try {
        await Deno.remove(deps.config.htmlRootDir, {recursive: true});
    } catch {
        console.log('Configured htmlRootDir does not appear to exist, it will be created.');
    } finally {
        await deps.ensureDir(deps.config.htmlRootDir);
    }
}

async function copy_static_dir_to_html_root_dir() {
    await deps.copy(
        deps.join(deps.config.djotRootDir, 'static'),
        deps.join(deps.config.htmlRootDir, 'static'),
        {overwrite: true});
}

async function transform_djot_to_html(djotFile: deps.WalkEntry) {
    const djotContent = await Deno.readTextFile(djotFile.path);
    const ast = deps.djot.parse(djotContent, {sourcePositions: false});
    const html = deps.djot.renderHTML(ast);
    const final = htmlTemplate.replace(deps.config.htmlContentToken, html);
    return final;
}

function calculate_output_file_path(djotFile: deps.WalkEntry) {
    let outFile = djotFile.path.replace(deps.config.djotRootDir, deps.config.htmlRootDir);

    if (djotFile.name == 'index.djot') {
        outFile = outFile.replace('.djot', '.html');
    }
    else {
        outFile = outFile.replace('.djot', '');
        outFile = deps.join(outFile, 'index.html');
    }

    return outFile;
}

export {
    deps,
    walk_djot_files_and_output_html,
    add_to_page_list,
    write_json,
    empty_html_root_dir,
    copy_static_dir_to_html_root_dir,
    transform_djot_to_html,
    calculate_output_file_path
}
