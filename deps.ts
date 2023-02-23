import djot from "npm:@djot/djot";
import config from "./config.json" assert {type: "json"};
import {walk, WalkEntry, copy, ensureDir} from "https://deno.land/std@0.177.0/fs/mod.ts";
import {join, dirname, basename} from "https://deno.land/std@0.177.0/path/mod.ts";

export {
    djot,
    config,
    walk, copy, ensureDir,
    join, dirname, basename
}

export type {
    WalkEntry
}
