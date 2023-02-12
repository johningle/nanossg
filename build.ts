import djot from "npm:@djot/djot";
import config from "./config.json" assert {type: "json"};
import {walk, WalkEntry, copy, ensureDir} from "https://deno.land/std@0.177.0/fs/mod.ts";
import {join, dirname} from "https://deno.land/std@0.177.0/path/mod.ts";

const htmlTemplate = await Deno.readTextFile(config.htmlTemplateFile);
await EmptyHtmlRootDir();
await CopyStaticDir();
await WalkDjotFilesAndOutputHtml();

async function WalkDjotFilesAndOutputHtml() {
    for await (const djotFile of walk(config.djotRootDir, {
        includeDirs: false,
        exts: ['.djot']
    })) {
        const finalHtml = await TransformDjotToHtml(djotFile);
        const outFile = CalculateOutputFilePath(djotFile);
        await ensureDir(dirname(outFile));
        await Deno.writeTextFile(outFile, finalHtml);
    }
}

async function EmptyHtmlRootDir() {
    try {
        await Deno.remove(config.htmlRootDir, {recursive: true});
    } catch {
        console.log('Configured htmlRootDir does not appear to exist, it will be created.');
    } finally {
        await ensureDir(config.htmlRootDir);
    }
}

async function CopyStaticDir() {
    await copy(
        join(config.djotRootDir, 'static'),
        join(config.htmlRootDir, 'static'),
        {overwrite: true});
}

async function TransformDjotToHtml(djotFile: WalkEntry) {
    const djotContent = await Deno.readTextFile(djotFile.path);
    const ast = djot.parse(djotContent, {sourcePositions: false});
    const html = djot.renderHTML(ast);
    const final = htmlTemplate.replace(config.htmlContentToken, html);
    return final;
}

function CalculateOutputFilePath(djotFile: WalkEntry) {
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
