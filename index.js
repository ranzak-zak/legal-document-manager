const DocumentGenerator = require('./src/document-generator');
const FileManager = require('./src/file-manager');
const DocumentAnalyzer = require('./src/document-analyzer');
const CaseManager = require('./src/case-manager');

class LegalDocumentManager {
  constructor() {
    this.documentGenerator = new DocumentGenerator();
    this.fileManager = new FileManager();
    this.documentAnalyzer = new DocumentAnalyzer();
    this.caseManager = new CaseManager();
    this.documents = new Map();
    this.cases = new Map();
  }

  async createDocument(caseId, documentType, content) {
    const document = await this.documentGenerator.generate({ caseId, documentType, content, timestamp: new Date() });
    this.documents.set(document.id, document);
    if (caseId) await this.caseManager.addDocumentToCase(caseId, document.id);
    return { success: true, document, message: `Document "${document.name}" created` };
  }

  async createCase(caseName, metadata = {}) {
    const caseObj = await this.caseManager.createCase(caseName, metadata);
    this.cases.set(caseObj.id, caseObj);
    return { success: true, case: caseObj };
  }
}

module.exports = LegalDocumentManager;