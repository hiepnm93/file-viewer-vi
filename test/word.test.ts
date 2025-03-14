import { Buffer } from 'buffer';
import cfb from 'cfb';
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Doc, DocPart, DataLocation, HyperlinkType, EncryptionType } from '../src/cv/lib';
import { parse_cfb } from '../src/package/vendors/word/cfb/index';


/**
 * 测试文档解析
 */
async function main(filePath: string) {
  try {
    const buffer = readFileSync(filePath)

    const file = cfb.read(buffer, { type: 'buffer' })
    const doc = parse_cfb(file)
    console.log(doc)
  } catch (error) {
    console.error('加载文档时出错:', error)
  }
}

// 如果直接运行此文件
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('请提供要解析的DOC文件路径');
        process.exit(1);
    }
    main(filePath);
}

export {
    readDoc,
    readDocContent,
    readFormatting,
    combineTextAndFormatting,
    main
};

describe('Doc', () => {
  let buffer: Buffer;

  beforeEach(() => {
    buffer = readFileSync(join(__dirname, 'test.doc'));
    console.log('\n读取测试文档，大小:', buffer.length, '字节');
  });

  describe('常规操作', () => {
    it('应该能跑通main函数', () => {
      main(join(__dirname, 'test.doc'));
    });
  });

  describe('基本信息', () => {
    it('应该能获取文档版本', () => {
      const doc = new Doc(buffer);
      const version = doc.getVersion();
      console.log('文档版本:', version);
      expect(version).toBeDefined();
      expect(['Word 97', 'Word 2000', 'Word 2002', 'Word 2003', 'Word 2007']).toContain(version);
    });

    it('应该能检查文档保护状态', () => {
      const doc = new Doc(buffer);
      const isPasswordProtected = doc.isPasswordProtected();
      const isReadOnly = doc.isReadOnly();
      console.log('文档保护状态:', {
        密码保护: isPasswordProtected,
        只读: isReadOnly
      });
      expect(typeof isPasswordProtected).toBe('boolean');
      expect(typeof isReadOnly).toBe('boolean');
    });
  });

  describe('文本提取', () => {
    it('应该能提取主文档文本', () => {
      const doc = new Doc(buffer);
      const text = doc.getText(DocPart.MainDocument);
      console.log('主文档文本(前100个字符):', text.slice(0, 100));
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
    });

    it('应该能提取所有文本', () => {
      const doc = new Doc(buffer);
      const text = doc.getAllText();
      console.log('所有文本(前100个字符):', text.slice(0, 100));
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
    });

    it('应该能获取字符迭代器', () => {
      const doc = new Doc(buffer);
      const iterator = doc.getCharIterator(DocPart.MainDocument);
      console.log('字符迭代器:', iterator ? '已创建' : '创建失败');
      expect(iterator).toBeDefined();
      
      if (iterator) {
        const char = iterator.next();
        console.log('第一个字符:', char);
        expect(char).toBeDefined();
        if (char) {
          expect(char.type).toBeDefined();
        }
      }
    });
  });

  describe('元数据', () => {
    it('应该能获取文档属性', () => {
      const doc = new Doc(buffer);
      const dop = doc.getDop();
      console.log('文档属性:', dop);
      expect(dop).toBeDefined();
    });


    it('应该能获取文档关联字符串表', () => {
      const doc = new Doc(buffer);
      const sttbfAssoc = doc.getSttbfAssoc();
      if (sttbfAssoc) {
        const metadata = {
          标题: sttbfAssoc.getTitle(),
          作者: sttbfAssoc.getAuthor(),
          主题: sttbfAssoc.getSubject(),
          注释: sttbfAssoc.getComments(),
          最后修改者: sttbfAssoc.getLastModifiedBy(),
          创建时间: sttbfAssoc.getCreateTime(),
          最后保存时间: sttbfAssoc.getLastSaveTime()
        };
        console.log('文档元数据:', metadata);
        expect(sttbfAssoc.getTitle()).toBeDefined();
        expect(sttbfAssoc.getAuthor()).toBeDefined();
        expect(sttbfAssoc.getSubject()).toBeDefined();
        expect(sttbfAssoc.getComments()).toBeDefined();
        expect(sttbfAssoc.getLastModifiedBy()).toBeDefined();
        expect(sttbfAssoc.getCreateTime()).toBeDefined();
        expect(sttbfAssoc.getLastSaveTime()).toBeDefined();
      }
    });
  });

  describe('图片处理', () => {
    it('应该能获取所有图片', () => {
      const doc = new Doc(buffer);
      const pictures = doc.getAllPictures();
      console.log('图片数量:', pictures.length);
      pictures.forEach((picture, index) => {
        console.log(`图片 ${index + 1}:`, {
          类型: picture.type,
          大小: picture.data.length
        });
      });
      expect(Array.isArray(pictures)).toBe(true);
      
      pictures.forEach(picture => {
        expect(picture.type).toBeDefined();
        expect(picture.data).toBeDefined();
        expect(picture.data).toBeInstanceOf(Buffer);
      });
    });

    it('应该能获取单个图片', () => {
      const doc = new Doc(buffer);
      const picture = doc.getPicture(DataLocation.PICFAndOfficeArtData);
      if (picture) {
        console.log('单个图片:', {
          类型: picture.type,
          大小: picture.data.length
        });
        expect(picture.type).toBeDefined();
        expect(picture.data).toBeInstanceOf(Buffer);
      }
    });
  });

  describe('超链接处理', () => {
    it('应该能获取所有超链接', () => {
      const doc = new Doc(buffer);
      const hyperlinks = doc.getAllHyperlinks();
      console.log('超链接数量:', hyperlinks.length);
      hyperlinks.forEach((link, index) => {
        console.log(`超链接 ${index + 1}:`, {
          类型: link.type,
          目标: link.target,
          文本: link.text
        });
      });
      expect(Array.isArray(hyperlinks)).toBe(true);
      
      hyperlinks.forEach(link => {
        expect(link.type).toBeDefined();
        expect(link.target).toBeDefined();
        expect(link.text).toBeDefined();
        expect(Object.values(HyperlinkType)).toContain(link.type);
      });
    });
  });

  describe('字段处理', () => {
    it('应该能获取所有字段', () => {
      const doc = new Doc(buffer);
      const fields = doc.getAllFields();
      console.log('字段数量:', fields.length);
      fields.forEach((field, index) => {
        console.log(`字段 ${index + 1}:`, {
          键: field.key,
          值: field.value
        });
      });
      expect(Array.isArray(fields)).toBe(true);
      
      fields.forEach(field => {
        expect(field.key).toBeDefined();
        expect(field.value).toBeDefined();
      });
    });
  });

  describe('加密处理', () => {
    it('应该能检测加密类型', () => {
      const doc = new Doc(buffer);
      const encryption = doc.getEncryption();
      console.log('加密信息:', encryption);
      if (encryption) {
        expect(Object.values(EncryptionType)).toContain(encryption.type);
        if (encryption.type !== EncryptionType.None) {
          expect(encryption.key).toBeDefined();
        }
      }
    });

    it('应该能设置加密密钥', () => {
      const doc = new Doc(buffer);
      const encryption = doc.getEncryption();
      if (encryption && encryption.key) {
        doc.setEncryptionKey(encryption.key);
        console.log('已设置加密密钥:', encryption.key);
        const text = doc.getText(DocPart.MainDocument);
        console.log('解密后文本(前100个字符):', text.slice(0, 100));
        expect(text).toBeDefined();
      }
    });
  });
});