// Case Manager Module
const { v4: uuidv4 } = require('uuid');

class CaseManager {
  constructor() {
    this.cases = new Map();
    this.caseDocuments = new Map();
    this.caseChats = new Map();
  }

  async createCase(caseName, metadata = {}) {
    const caseId = uuidv4();
    
    const caseObj = {
      id: caseId,
      name: caseName,
      status: metadata.status || 'open',
      type: metadata.type || 'general',
      client: metadata.client || '',
      opponent: metadata.opponent || '',
      courtName: metadata.courtName || '',
      caseNumber: metadata.caseNumber || '',
      judge: metadata.judge || '',
      description: metadata.description || '',
      priority: metadata.priority || 'medium',
      createdAt: new Date(),
      modifiedAt: new Date(),
      createdBy: metadata.createdBy || 'System',
      dueDate: metadata.dueDate || null,
      documents: [],
      folders: [],
      tags: metadata.tags || [],
      customFields: metadata.customFields || {}
    };

    this.cases.set(caseId, caseObj);
    this.caseDocuments.set(caseId, []);
    this.caseChats.set(caseId, []);

    return caseObj;
  }

  async addDocumentToCase(caseId, documentId) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      throw new Error('Case not found');
    }

    if (!caseObj.documents.includes(documentId)) {
      caseObj.documents.push(documentId);
      caseObj.modifiedAt = new Date();
    }

    return caseObj;
  }

  async addDocumentsToCase(caseId, documentIds) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      throw new Error('Case not found');
    }

    documentIds.forEach(docId => {
      if (!caseObj.documents.includes(docId)) {
        caseObj.documents.push(docId);
      }
    });

    caseObj.modifiedAt = new Date();
    return caseObj;
  }

  async getDocuments(caseId) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      throw new Error('Case not found');
    }

    return caseObj.documents;
  }

  removeDocumentFromCase(caseId, documentId) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      throw new Error('Case not found');
    }

    caseObj.documents = caseObj.documents.filter(id => id !== documentId);
    caseObj.modifiedAt = new Date();

    return caseObj;
  }

  updateCaseStatus(caseId, status) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      throw new Error('Case not found');
    }

    const validStatuses = ['open', 'active', 'pending', 'closed', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    caseObj.status = status;
    caseObj.modifiedAt = new Date();

    return caseObj;
  }

  getCase(caseId) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      throw new Error('Case not found');
    }

    return caseObj;
  }

  listCases(filters = {}) {
    let cases = Array.from(this.cases.values());

    if (filters.status) {
      cases = cases.filter(c => c.status === filters.status);
    }

    if (filters.type) {
      cases = cases.filter(c => c.type === filters.type);
    }

    if (filters.client) {
      cases = cases.filter(c => 
        c.client.toLowerCase().