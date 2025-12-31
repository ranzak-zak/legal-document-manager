// Document Analyzer Module
class DocumentAnalyzer {
  constructor() {
    this.legalKeywords = {
      obligations: ['must', 'shall', 'required to', 'obligated to'],
      rights: ['may', 'entitled to', 'has the right to', 'can'],
      penalties: ['penalty', 'fine', 'breach', 'violation', 'damages'],
      dates: ['on or before', 'within', 'by', 'effective date', 'expiration'],
      parties: ['party', 'parties', 'hereinafter', 'referred to as']
    };
  }

  async analyze(document) {
    try {
      const analysis = {
        documentId: document.id,
        documentType: document.type,
        analyzedAt: new Date(),
        summary: this._generateSummary(document),
        keyPoints: this._extractKeyPoints(document),
        legalTerms: this._extractLegalTerms(document),
        sections: this._analyzeStructure(document),
        sentiment: this._analyzeSentiment(document),
        risks: this._identifyRisks(document),
        recommendations: this._generateRecommendations(document),
        readability: this._calculateReadability(document)
      };

      return analysis;
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  _generateSummary(document) {
    const contentText = this._extractAllText(document);
    const sentences = contentText.split('.').filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ');

    return {
      text: summary,
      wordCount: contentText.split(/\s+/).length,
      sentenceCount: sentences.length,
      characterCount: contentText.length
    };
  }

  _extractKeyPoints(document) {
    const keyPoints = [];
    const contentText = this._extractAllText(document);
    const sentences = contentText.split('.');

    sentences.forEach((sentence, index) => {
      Object.entries(this.legalKeywords).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (sentence.toLowerCase().includes(keyword)) {
            keyPoints.push({
              category: category,
              text: sentence.trim(),
              importance: 'high'
            });
          }
        });
      });
    });

    return keyPoints.slice(0, 10);
  }

  _extractLegalTerms(document) {
    const commonLegalTerms = [
      'agreement', 'contract', 'party', 'obligation', 'breach',
      'indemnify', 'liability', 'damages', 'force majeure',
      'arbitration', 'governing law', 'jurisdiction',
      'entire agreement', 'amendment', 'severability'
    ];

    const contentText = this._extractAllText(document).toLowerCase();
    const foundTerms = [];

    commonLegalTerms.forEach(term => {
      if (contentText.includes(term)) {
        foundTerms.push({
          term: term,
          occurrences: this._countOccurrences(contentText, term)
        });
      }
    });

    return foundTerms.sort((a, b) => b.occurrences - a.occurrences);
  }

  _analyzeStructure(document) {
    return {
      totalSections: Object.keys(document.content.sections).length,
      sections: Object.entries(document.content.sections).map(([key, section]) => ({
        name: section.heading,
        wordCount: section.content.split(/\s+/).length,
        isEmpty: section.content.includes('[Add') && section.content.includes('here]')
      }))
    };
  }

  _analyzeSentiment(document) {
    const contentText = this._extractAllText(document).toLowerCase();
    const positiveWords = ['agree', 'beneficial', 'clear', 'fair', 'reasonable'];
    const negativeWords = ['breach', 'liable', 'penalty', 'violation', 'dispute'];

    let positiveCount = positiveWords.filter(word => contentText.includes(word)).length;
    let negativeCount = negativeWords.filter(word => contentText.includes(word)).length;

    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral';

    return {
      overall: sentiment,
      positiveIndicators: positiveCount,
      negativeIndicators: negativeCount
    };
  }

  _identifyRisks(document) {
    const risks = [];
    const contentText = this._extractAllText(document);

    if (contentText.includes('[Add') && contentText.includes('here]')) {
      risks.push({
        type: 'incomplete_content',
        severity: 'high',
        description: 'Document contains placeholder text that needs to be filled'
      });
    }

    if (contentText.toLowerCase().includes('liable')) {
      risks.push({
        type: 'liability_clause',
        severity: 'medium',
        description: 'Document contains liability provisions'
      });
    }

    if (contentText.toLowerCase().includes('may')) {
      risks.push({
        type: 'ambiguous_language',
        severity: 'low',
        description: 'Document contains optional language ("may")'
      });
    }

    return risks;
  }

  _generateRecommendations(document) {
    const recommendations = [];

    if (document.metadata.status === 'draft') {
      recommendations.push({
        priority: 'high',
        text: 'Document is still in draft status. Review and finalize before use.'
      });
    }

    if (!document.metadata.author || document.metadata.author === 'System') {
      recommendations.push({
        priority: 'medium',
        text: 'Assign proper author to document'
      });
    }

    if (!document.analysis) {
      recommendations.push({
        priority: 'medium',
        text: 'Run full legal analysis for comprehensive review'
      });
    }

    return recommendations;
  }

  _calculateReadability(document) {
    const contentText = this._extractAllText(document);
    const words = contentText.split(/\s+/).length;
    const sentences = contentText.split(/[.!?]/).length;
    const syllables = this._estimateSyllables(contentText);

    const readingEase = Math.max(0, Math.min(100,
      206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
    ));

    return {
      score: Math.round(readingEase),
      difficulty: readingEase > 80 ? 'Easy' : 
                 readingEase > 50 ? 'Medium' : 
                 readingEase > 30 ? 'Difficult' : 'Very Difficult',
      wordCount: words,
      sentenceCount: sentences
    };
  }

  _extractAllText(document) {
    let text = document.content.title || '';
    
    Object.values(document.content.sections).forEach(section => {
      text += ' ' + (section.content || '');
    });

    return text;
  }

  _countOccurrences(text, word) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  _estimateSyllables(text) {
    const syllableRegex = /[aeiou]{1,2}/gi;
    const matches = text.match(syllableRegex);
    return matches ? matches.length : 0;
  }

  comparDocuments(doc1, doc2) {
    return {
      similarities: this._findSimilarities(doc1, doc2),
      differences: this._findDifferences(doc1, doc2),
      structuralDifferences: this._compareStructure(doc1, doc2)
    };
  }

  _findSimilarities(doc1, doc2) {
    const text1 = this._extractAllText(doc1).toLowerCase();
    const text2 = this._extractAllText(doc2).toLowerCase();

    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    const common = [...words1].filter(word => words2.has(word));
    
    return {
      commonWords: common.length,
      commonTerms: common.slice(0, 20)
    };
  }

  _findDifferences(doc1, doc2) {
    const text1 = this._extractAllText(doc1).toLowerCase();
    const text2 = this._extractAllText(doc2).toLowerCase();

    return {
      lengthDifference: Math.abs(text1.length - text2.length),
      wordCountDifference: Math.abs(
        text1.split(/\s+/).length - text2.split(/\s+/).length
      )
    };
  }

  _compareStructure(doc1, doc2) {
    return {
      doc1Sections: Object.keys(doc1.content.sections).length,
      doc2Sections: Object.keys(doc2.content.sections).length
    };
  }
}

module.exports = DocumentAnalyzer;