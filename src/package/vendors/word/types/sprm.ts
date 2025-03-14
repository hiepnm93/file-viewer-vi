import type { CharacterFormatting } from ".";

/**
 * Sprm (Single Property Modifier) 操作码
 * [MS-DOC] 2.6.1-2.6.4 
 */
export const enum SprmCodes {
    // 字符属性 [MS-DOC] 2.6.1
    sprmCFRMarkDel = 0x0800,
    sprmCFRMarkIns = 0x0801,
    sprmCFFldVanish = 0x0802,
    sprmCPicLocation = 0x6A03,
    sprmCIbstRMark = 0x4804,
    sprmCDttmRMark = 0x6805,
    sprmCFData = 0x0806,
    sprmCIdslRMark = 0x4807,
    sprmCSymbol = 0x6A09,
    sprmCFOle2 = 0x080A,
    sprmCHighlight = 0x2A0C,
    sprmCFWebHidden = 0x0811,
    sprmCRsidProp = 0x6815,
    sprmCRsidText = 0x6816,
    sprmCRsidRMDel = 0x6817,
    sprmCFSpecVanish = 0x0818,
    sprmCFMathPr = 0xC81A,
    sprmCIstd = 0x4A30,
    sprmCIstdPermute = 0xCA31,
    sprmCPlain = 0x2A33,
    sprmCKcd = 0x2A34,
    sprmCFBold = 0x0835,
    sprmCFItalic = 0x0836,
    sprmCFStrike = 0x0837,
    sprmCFOutline = 0x0838,
    sprmCFShadow = 0x0839,
    sprmCFSmallCaps = 0x083A,
    sprmCFCaps = 0x083B,
    sprmCFVanish = 0x083C,
    sprmCKul = 0x2A3E,
    sprmCDxaSpace = 0x8840,
    sprmCIco = 0x2A42,
    sprmCHps = 0x4A43,
    sprmCHpsPos = 0x4845,
    sprmCMajority = 0xCA47,
    sprmCIss = 0x2A48,
    sprmCHpsKern = 0x484B,
    sprmCHresi = 0x484E,
    sprmCRgFtc0 = 0x4A4F,
    sprmCRgFtc1 = 0x4A50,
    sprmCRgFtc2 = 0x4A51,
    sprmCCharScale = 0x4852,
    sprmCFDStrike = 0x2A53,
    sprmCFImprint = 0x0854,
    sprmCFSpec = 0x0855,
    sprmCFObj = 0x0856,
    sprmCPropRMark90 = 0xCA57,
    sprmCFEmboss = 0x0858,
    sprmCSfxText = 0x2859,
    sprmCFBiDi = 0x085A,
    sprmCFBoldBi = 0x085C,
    sprmCFItalicBi = 0x085D,
    sprmCFtcBi = 0x4A5E,
    sprmCLidBi = 0x485F,
    sprmCIcoBi = 0x4A60,
    sprmCHpsBi = 0x4A61,

    // 段落属性 [MS-DOC] 2.6.3
    sprmPIstd = 0x4600,
    sprmPIstdPermute = 0xC601,
    sprmPIncLvl = 0x2602,
    sprmPJc80 = 0x2403,
    sprmPFKeep = 0x2405,
    sprmPFKeepFollow = 0x2406,
    sprmPFPageBreakBefore = 0x2407,
    sprmPIlvl = 0x260A,
    sprmPIlfo = 0x460B,
    sprmPFNoLineNumb = 0x240C,
    sprmPChgTabsPapx = 0xC60D,
    sprmPDxaRight80 = 0x840E,
    sprmPDxaLeft80 = 0x840F,
    sprmPNest80 = 0x4610,
    sprmPDxaLeft180 = 0x8411,
    sprmPDyaLine = 0x6412,
    sprmPDyaBefore = 0xA413,
    sprmPDyaAfter = 0xA414,
    sprmPChgTabs = 0xC615,
    sprmPFInTable = 0x2416,
    sprmPFTtp = 0x2417,
    sprmPDxaAbs = 0x8418,
    sprmPDyaAbs = 0x8419,
    sprmPDxaWidth = 0x841A,
    sprmPPc = 0x261B,
    sprmPWr = 0x2423,
    sprmPBrcTop80 = 0x6424,
    sprmPBrcLeft80 = 0x6425,
    sprmPBrcBottom80 = 0x6426,
    sprmPBrcRight80 = 0x6427,
    sprmPBrcBetween80 = 0x6428,
    sprmPBrcBar80 = 0x6629,
    sprmPFNoAutoHyph = 0x242A,
    sprmPWHeightAbs = 0x442B,
    sprmPDcs = 0x442C,
    sprmPShd80 = 0x442D,
    sprmPDyaFromText = 0x842E,
    sprmPDxaFromText = 0x842F,
    sprmPFLocked = 0x2430,
    sprmPFWidowControl = 0x2431,
    sprmPFKinsoku = 0x2433,
    sprmPFWordWrap = 0x2434,
    sprmPFOverflowPunct = 0x2435,
    sprmPFTopLinePunct = 0x2436,
    sprmPFAutoSpaceDE = 0x2437,
    sprmPFAutoSpaceDN = 0x2438,
    sprmPWAlignFont = 0x4439,
    sprmPFrameTextFlow = 0x443A,
    sprmPOutLvl = 0x2640,
    sprmPFBiDi = 0x2441,
    sprmPFNumRMIns = 0x2443,
    sprmPNumRM = 0xC645,
    sprmPHugePapx = 0x6646,
    sprmPFUsePgsuSettings = 0x2447,
    sprmPFAdjustRight = 0x2448,
    sprmPItap = 0x6649,
    sprmPDtap = 0x664A,
    sprmPFInnerTableCell = 0x244B,
    sprmPFInnerTtp = 0x244C,
    sprmPAnld80 = 0xC63E,
    sprmPShd = 0xC64D,
    sprmPBrcTop = 0xC64E,
    sprmPBrcLeft = 0xC64F,
    sprmPBrcBottom = 0xC650,
    sprmPBrcRight = 0xC651,
    sprmPBrcBetween = 0xC652,
    sprmPBrcBar = 0xC653,
    sprmPDxcRight = 0x4455,
    sprmPDxcLeft = 0x4456,
    sprmPDxcLeft1 = 0x4457,
    sprmPDylBefore = 0x4458,
    sprmPDylAfter = 0x4459,
    sprmPFOpenTch = 0x245A,
    sprmPFDyaBeforeAuto = 0x245B,
    sprmPFDyaAfterAuto = 0x245C,
    sprmPDxaRight = 0x845D,
    sprmPDxaLeft = 0x845E,
    sprmPNest = 0x465F,
    sprmPDxaLeft1 = 0x8460,
    sprmPJc = 0x2461,

    // 表格属性 [MS-DOC] 2.6.3
    sprmTJc90 = 0x5400,
    sprmTDxaLeft = 0x9601,
    sprmTDxaGapHalf = 0x9602,
    sprmTFCantSplit90 = 0x3403,
    sprmTTableHeader = 0x3404,
    sprmTTableBorders80 = 0xD605,
    sprmTDyaRowHeight = 0x9407,
    sprmTDefTable = 0xD608,
    sprmTDefTableShd80 = 0xD609,
    sprmTTlp = 0x740A,
    sprmTFBiDi = 0x560B,
    sprmTDefTableShd3rd = 0xD60C,
    sprmTPc = 0x360D,
    sprmTDxaAbs = 0x940E,
    sprmTDyaAbs = 0x940F,
    sprmTDxaFromText = 0x9410,
    sprmTDyaFromText = 0x9411,

    // 节属性 [MS-DOC] 2.6.4
    sprmScnsPgn = 0x3000,
    sprmSiHeadingPgn = 0x3001,
    sprmSDxaColWidth = 0xF203,
    sprmSDxaColSpacing = 0xF204,
    sprmSFEvenlySpaced = 0x3005,
    sprmSFProtected = 0x3006,
    sprmSDmBinFirst = 0x5007,
    sprmSDmBinOther = 0x5008,
    sprmSBkc = 0x3009,
    sprmSFTitlePage = 0x300A,
    sprmSCcolumns = 0x500B,
    sprmSDxaColumns = 0x900C,

    // 图片属性
    sprmPicBrcTop80 = 0x6C02,
    sprmPicBrcLeft80 = 0x6C03,
    sprmPicBrcBottom80 = 0x6C04,
    sprmPicBrcRight80 = 0x6C05,
    sprmPicBrcTop = 0xCE08,
    sprmPicBrcLeft = 0xCE09,
    sprmPicBrcBottom = 0xCE0A,
    sprmPicBrcRight = 0xCE0B
}

/**
 * 解析单个Sprm属性
 * @param sprm Sprm操作码
 * @param operand 操作数Buffer
 * @returns 格式属性
 */
export function parseSprmProperty(sprm: number, operand: Buffer): CharacterFormatting | null {
    const property: CharacterFormatting = {
        sprm: {
            sgc: (sprm >> 13) & 0x7
        },
        value: null
    };

    switch (sprm) {
        // 字符格式
        case SprmCodes.sprmCFRMarkDel:
            property.sprm.sprmCode = 'revision.deleted';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFRMarkIns:
            property.sprm.sprmCode = 'revision.inserted';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCPicLocation:
            property.sprm.sprmCode = 'pictureOffset';
            property.value = operand.readUInt32LE(0);
            return property;

        case SprmCodes.sprmCIbstRMark:
            property.sprm.sprmCode = 'revision.authorIndex';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmCDttmRMark:
            property.sprm.sprmCode = 'revision.date';
            property.value = operand.readUInt32LE(0);
            return property;

        case SprmCodes.sprmCFData:
            property.sprm.sprmCode = 'fieldCode';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCSymbol:
            property.sprm.sprmCode = 'symbol';
            property.value = {
                font: operand.readUInt16LE(0),
                char: operand.readUInt16LE(2)
            };
            return property;

        case SprmCodes.sprmCHighlight:
            property.sprm.sprmCode = 'highlight';
            property.value = operand[0];
            return property;

        case SprmCodes.sprmCFWebHidden:
            property.sprm.sprmCode = 'webHidden';
            property.value = operand[0] !== 0;
            return property;

        // 基本字符格式
        case SprmCodes.sprmCFBold:
            property.sprm.sprmCode = 'bold';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFItalic:
            property.sprm.sprmCode = 'italic';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFStrike:
            property.sprm.sprmCode = 'strike';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFOutline:
            property.sprm.sprmCode = 'outline';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFShadow:
            property.sprm.sprmCode = 'shadow';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFSmallCaps:
            property.sprm.sprmCode = 'smallCaps';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFCaps:
            property.sprm.sprmCode = 'allCaps';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFVanish:
            property.sprm.sprmCode = 'hidden';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCKul:
            property.sprm.sprmCode = 'underline';
            property.value = operand[0];  // 下划线类型
            return property;

        case SprmCodes.sprmCDxaSpace:
            property.sprm.sprmCode = 'spacing';
            property.value = operand.readInt16LE(0);
            return property;

        case SprmCodes.sprmCIco:
            property.sprm.sprmCode = 'color';
            property.value = operand[0];
            return property;

        case SprmCodes.sprmCHps:
            property.sprm.sprmCode = 'fontSize';
            property.value = operand.readUInt16LE(0) / 2;  // 字号需要除以2
            return property;

        case SprmCodes.sprmCHpsPos:
            property.sprm.sprmCode = 'position';
            property.value = operand.readInt16LE(0);
            return property;

        case SprmCodes.sprmCHpsKern:
            property.sprm.sprmCode = 'kerning';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmCRgFtc0:
            property.sprm.sprmCode = 'fontFamily';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmCRgFtc1:
            property.sprm.sprmCode = 'fontFamilyBi';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmCCharScale:
            property.sprm.sprmCode = 'scale';
            property.value = operand.readUInt16LE(0);
            return property;

        // 双向文本属性
        case SprmCodes.sprmCFBiDi:
            property.sprm.sprmCode = 'rtl';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFBoldBi:
            property.sprm.sprmCode = 'boldBi';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCFItalicBi:
            property.sprm.sprmCode = 'italicBi';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmCHpsBi:
            property.sprm.sprmCode = 'fontSizeBi';
            property.value = operand.readUInt16LE(0) / 2;
            return property;
    }
    
    return null;
}

/**
 * 解析段落属性
 */
export function parseParagraphProperty(sprm: number, operand: Buffer): CharacterFormatting | null {
    const property: CharacterFormatting = {
        sprm: {
            sgc: (sprm >> 13) & 0x7
        },
        value: null
    };

    switch (sprm) {
        // 段落样式
        case SprmCodes.sprmPIstd:
            property.sprm.sprmCode = 'styleId';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmPJc:
        case SprmCodes.sprmPJc80:
            property.sprm.sprmCode = 'alignment';
            property.value = operand[0];
            return property;

        // 段落间距
        case SprmCodes.sprmPDyaBefore:
            property.sprm.sprmCode = 'spacingBefore';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmPDyaAfter:
            property.sprm.sprmCode = 'spacingAfter';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmPDyaLine:
            property.sprm.sprmCode = 'lineSpacing';
            property.value = operand.readInt16LE(0);
            return property;

        // 段落缩进
        case SprmCodes.sprmPDxaLeft:
        case SprmCodes.sprmPDxaLeft80:
            property.sprm.sprmCode = 'leftIndent';
            property.value = operand.readInt16LE(0);
            return property;

        case SprmCodes.sprmPDxaRight:
        case SprmCodes.sprmPDxaRight80:
            property.sprm.sprmCode = 'rightIndent';
            property.value = operand.readInt16LE(0);
            return property;

        case SprmCodes.sprmPDxaLeft1:
        case SprmCodes.sprmPDxaLeft180:
            property.sprm.sprmCode = 'firstLineIndent';
            property.value = operand.readInt16LE(0);
            return property;

        // 段落边框
        case SprmCodes.sprmPBrcTop:
        case SprmCodes.sprmPBrcTop80:
            property.sprm.sprmCode = 'borderTop';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmPBrcLeft:
        case SprmCodes.sprmPBrcLeft80:
            property.sprm.sprmCode = 'borderLeft';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmPBrcBottom:
        case SprmCodes.sprmPBrcBottom80:
            property.sprm.sprmCode = 'borderBottom';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmPBrcRight:
        case SprmCodes.sprmPBrcRight80:
            property.sprm.sprmCode = 'borderRight';
            property.value = operand.readUInt16LE(0);
            return property;

        case SprmCodes.sprmPBrcBetween:
        case SprmCodes.sprmPBrcBetween80:
            property.sprm.sprmCode = 'borderBetween';
            property.value = operand.readUInt16LE(0);
            return property;

        // 段落格式
        case SprmCodes.sprmPFKeep:
            property.sprm.sprmCode = 'keepLines';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmPFKeepFollow:
            property.sprm.sprmCode = 'keepNext';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmPFPageBreakBefore:
            property.sprm.sprmCode = 'pageBreakBefore';
            property.value = operand[0] !== 0;
            return property;

        case SprmCodes.sprmPFWidowControl:
            property.sprm.sprmCode = 'widowControl';
            property.value = operand[0] !== 0;
            return property;

        // 段落阴影
        case SprmCodes.sprmPShd:
        case SprmCodes.sprmPShd80:
            property.sprm.sprmCode = 'shading';
            property.value = operand.readUInt16LE(0);
            return property;

        // 段落制表位
        case SprmCodes.sprmPChgTabs:
        case SprmCodes.sprmPChgTabsPapx:
            property.sprm.sprmCode = 'tabs';
            // 制表位数据结构比较复杂，需要单独处理
            property.value = operand;
            return property;

        // 段落列表
        case SprmCodes.sprmPIlvl:
            property.sprm.sprmCode = 'listLevel';
            property.value = operand[0];
            return property;

        case SprmCodes.sprmPIlfo:
            property.sprm.sprmCode = 'listId';
            property.value = operand.readUInt16LE(0);
            return property;
    }

    return null;
}