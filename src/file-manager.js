// File Manager Module
const { v4: uuidv4 } = require('uuid');

class FileManager {
  constructor() {
    this.uploads = new Map();
    this.folders = new Map();
    this.maxFileSize = 500 * 1024 * 1024; // 500 MB
    this.supportedFormats = [
      'pdf', 'docx', 'doc', 'txt', 'rtf',
      'jpg', 'png', 'gif',
      'mp3', 'wav',
      'mp4', 'avi',
      'pptx', 'ppt'
    ];
  }

  createFolder(folderName, parentFolderId = null) {
    const folderId = uuidv4();
    const folder = {
      id: folderId,
      name: folderName,
      parentId: parentFolderId,
      children: [],
      documents: [],
      created: new Date(),
      modified: new Date()
    };

    this.folders.set(folderId, folder);

    if (parentFolderId && this.folders.has(parentFolderId)) {
      const parent = this.folders.get(parentFolderId);
      parent.children.push(folderId);
    }

    return folder;
  }

  async uploadToServer(filePath, caseId) {
    try {
      const extension = this._getFileExtension(filePath);
      if (!th