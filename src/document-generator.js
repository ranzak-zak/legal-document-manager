// Document Generator Module
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class DocumentGenerator {
  constructor() {
    this.templates = {
      contract: {
        title: 'Legal Contract',
        sections: ['Header', 'Parties', 'Terms', 'Conditions', 'Signatures']
      },
      brief: {
        title: 'Legal Brief',
        sections: ['Title', 'Statement of Facts', 'Legal Issues', 'Arguments', 'Conclusion']
      },
      memo: {
        title: 'Legal Memorandum',
        sections: ['To', 'From', 'Date', 'Subject', 'Issue', 'Analysis', 'Conclusion']
      },
      complaint: {
        title: 'Legal Complaint',
        sections: ['Heading', 'Introduction', 'Jurisdiction', 'Parties', 'Facts', 'Claims', 'Prayer for Relief']
      },
      agreement: {
        title: 'Agreement',
        sections: ['Preamble', 'Recitals', 'Terms and Conditions', 'Signatures']
      }
    };
  }

  async generate(options) {
    const {
      caseId,
      documentType = 'memo',
      content = {},
      timestamp = new Date()
    } = options;

    if (!this.templates[documentType]) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    const template = this.templates[documentType];
    const documentId = uuidv4();
    const documentName = `${template.title}_${moment(timestamp).format('YYYY-MM-DD_HHmmss')}`;

    const document = {
      id: documentId,
      name: documentName,
      type: documentType,
      caseId: caseId,
      template: template,
      content: this._generateContent(template, content),
      metadata: {
        created: timestamp,
        modified: timestamp,
        author: content.author || 'System',
        status: 'draft'
      },
      version: 1,
      tags: content.tags || [],
      analysis: null
    };

    return document;
  }

  _generateContent(template, contentData) {
    const generatedContent = {
      title: contentData.title || template.title,
      sections: {}
    };

    template.sections.forEach(section => {
      generatedContent.sections[section] = {
        heading: section,
        content: contentData[section] || `[Add ${section} content here]`,
        timestamp: new Date()
      };
    });

    return generatedContent;
  }

  getTemplates() {
    return this.templates;
  }

  addTemplate(name, config) {
    this.templates[name] = config;
    return { success: true, message: `Template "${name}" added` };
  }

  updateDocument(document, updates) {
    document.content = {
      ...document.content,
      ...updates
    };
    document.metadata.modified = new Date();
    document.version += 1;

    return document;
  }

  async exportDocument(document, format = 'txt') {
    const supportedFormats = ['txt', 'html', 'json', 'pdf'];

    if (!supportedFormats.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    try {
      let exportedContent;

      switch (format) {
        case 'txt':
          exportedContent = this._exportAsText(document);
          break;
        case 'html':
          exportedContent = this._exportAsHTML(document);
          break;
        case 'json':
          exportedContent = JSON.stringify(document, null, 2);
          break;
        case 'pdf':
          exportedContent = `[PDF Export: ${document.name}]`;
          break;
        default:
          exportedContent = this._exportAsText(document);
      }

      return {
        success: true,
        format: format,
        filename: `${document.name}.${format}`,
        content: exportedContent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  _exportAsText(document) {
    let text = `${document.content.title}\n`;
    text += `Type: ${document.type}\n`;
    text += `Created: ${document.metadata.created}\n`;
    text += `Author: ${document.metadata.author}\n`;
    text += `\n${'='.repeat(50)}\n\n`;

    Object.values(document.content.sections).forEach(section => {
      text += `${section.heading}\n`;
      text += `${'-'.repeat(section.heading.length)}\n`;
      text += `${section.content}\n\n`;
    });

    return text;
  }

  _exportAsHTML(document) {
    let html = `<html><head><title>${document.content.title}</title></head><body>\n`;
    html += `<h1>${document.content.title}</h1>\n`;
    html += `<p><small>Type: ${document.type} | Author: ${document.metadata.author}</small></p>\n`;
    html += `<hr>\n`;

    Object.values(document.content.sections).forEach(section => {
      html += `<h2>${section.heading}</h2>\n`;
      html += `<p>${section.content}</p>\n`;
    });

    html += `</body></html>`;
    return html;
  }
}

module.exports = DocumentGenerator;