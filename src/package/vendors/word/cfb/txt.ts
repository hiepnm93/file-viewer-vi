import { Buffer } from 'buffer';
import type { WJSDoc, WJSPara, WJSParaElement } from '../types';

interface WriteOptions {
    RS?: string;
}

function write_para_elt_str(elt: WJSParaElement, opts?: WriteOptions): string {
    const RS = opts?.RS || "\n";
    switch (elt.t) {
        case "s":
            return elt.v;
        case "t":
            return (elt.r).map(tr => 
                tr.c.map(tc => 
                    tc.p.map(p => 
                        write_para_str(p, opts)
                    ).join(RS)
                ).join(RS)
            ).join(RS);
        default:
            throw new Error(`Cannot generate plaintext for ${elt.t} elements`);
    }
}

function write_para_str(para: WJSPara, opts?: WriteOptions): string {
    return para.elts.map(elt => write_para_elt_str(elt, opts)).join("");
}

export function write_str(doc: WJSDoc, opts?: WriteOptions): string {
    const RS = opts?.RS || "\n";
    return doc.p.map(para => write_para_str(para, opts)).join(RS) + RS;
}

export function write_buf(doc: WJSDoc, opts?: WriteOptions): Buffer {
    return Buffer.from(write_str(doc, opts));
}