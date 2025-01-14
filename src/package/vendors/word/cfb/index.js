import cfb from 'cfb'
import { parseClx, getTxt } from './clx'
import { readFib } from './fib'
import { Buffer } from 'buffer'

/** [MS-DOC] 2.4.1 Retrieving Text */
function getDocTxt(fib, docStream, tableStream) {
    var fibRgLw = fib.fibRgLw, fibRgFcLcbBlob = fib.fibRgFcLcbBlob;
    var fcClx = fibRgFcLcbBlob.fcClx, lcbClx = fibRgFcLcbBlob.lcbClx;
    var clx = tableStream.slice(fcClx, fcClx + lcbClx);
    var plcPcd = parseClx(clx);
    var txt = getTxt(fibRgLw, plcPcd, docStream);
    /* grab the body text */
    return txt.length == fibRgLw.ccpText ? txt.slice(0, -1) : txt.slice(0, fibRgLw.ccpText);
  }
  

/**
 * 解析cfb
 * @param file
 * @returns {{p: *[]}}
 */
export function parse_cfb(file) {
    /* [MS-DOC] 2.4.1 Retrieving Text */
    var wordDocument = cfb.find(file, "/WordDocument");
    var wordStream = Buffer.from(wordDocument.content);
    var fib = readFib(wordStream);
    var tableName = fib.base.fWhichTblStm === 1 ? "/1Table" : "/0Table";
    var table = cfb.find(file, tableName);
    var tableStream = Buffer.from(table.content);
    var text = getDocTxt(fib, wordStream, tableStream);
    /* TODO: 2.8.25 strip fields */
    text = text.replace(/\x13.*?\x14(.*?)\x15/g, "$1");
    text = text.replace(/\x13.*?\x15/g, "");
    /* TODO: 1.3.5 Inline Picture 0x01, Floating 0x08 */
    text = text.replace(/[\x01\x08]/g, "");
    /* TODO: 2.4.3 Table cell mark is 0x07 */
    text = text.replace(/\x07/g, "\t");
    // TODO: correctly split into paragraphs
    // getParagraphs(fib, wordStream, tableStream);
    var doc = { p: [] };
    var para = { elts: [] };
    para.elts.push({ t: "s", v: text });
    doc.p.push(para);
    return doc;
  }