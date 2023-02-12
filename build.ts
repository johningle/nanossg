import djot from "npm:@djot/djot";
import config from "./config.json" assert {type: "json"};
import {walk, copy, ensureDir} from "https://deno.land/std@0.177.0/fs/mod.ts";
import {join} from "https://deno.land/std@0.177.0/path/mod.ts";

const tmpl = await Deno.readTextFile(config.htmlTemplate);
await Deno.remove(config.htmlRoot, {recursive: true});
await ensureDir(config.htmlRoot);

// convert all djot files
for await (const djotFile of walk(config.djotRoot, {
    includeDirs: false,
    exts: ['.djot']
})) {
    // transform the djot and replace the template token with it
    const djotContent = await Deno.readTextFile(djotFile.path);
    const ast = djot.parse(djotContent, {sourcePositions: false});
    const html = djot.renderHTML(ast);
    const final = tmpl.replace(config.contentToken, html);

    // determine output directory and file
    let outDir = config.htmlRoot;
    if (djotFile.path !== join(config.djotRoot, 'index.djot').toString())
        outDir = join(config.htmlRoot, djotFile.name.replace('.djot', ''));

    const outFile = join(outDir, 'index.html');

    // ensure the target output directory for the file exists
    await ensureDir(outDir);
    await Deno.writeTextFile(outFile, final);
}

// copy static directory verbatim
await copy(join(config.djotRoot, 'static'), join(config.htmlRoot, 'static'), {overwrite: true});
