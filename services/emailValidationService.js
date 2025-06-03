const dns = require('dns').promises;

/**
 * Email Validation Service
 * Hybrid approach: Format validation + Domain validation
 */
class EmailValidationService {
  
  /**
   * Validate email format using regex
   * @param {string} email - Email to validate
   * @returns {object} - Validation result
   */
  validateFormat(email) {
    try {
      // Comprehensive email regex
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
      if (!email || typeof email !== 'string') {
        return {
          valid: false,
          reason: 'Email harus berupa string yang valid'
        };
      }
      
      if (email.length > 254) {
        return {
          valid: false,
          reason: 'Email terlalu panjang (maksimal 254 karakter)'
        };
      }
      
      if (!emailRegex.test(email)) {
        return {
          valid: false,
          reason: 'Format email tidak valid'
        };
      }
      
      // Check for common typos
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const domain = email.split('@')[1].toLowerCase();
      
      // Check for common typos like gmial.com, yahooo.com
      const typoChecks = {
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com',
        'outlok.com': 'outlook.com'
      };
      
      if (typoChecks[domain]) {
        return {
          valid: false,
          reason: `Mungkin maksud Anda: ${email.replace(domain, typoChecks[domain])}?`
        };
      }
      
      return {
        valid: true,
        reason: 'Format email valid'
      };
      
    } catch (error) {
      return {
        valid: false,
        reason: 'Error validating email format'
      };
    }
  }
  
  /**
   * Validate email domain using DNS lookup
   * @param {string} email - Email to validate
   * @returns {object} - Validation result
   */
  async validateDomain(email) {
    try {
      const domain = email.split('@')[1].toLowerCase();
      
      // Check if domain has MX record (mail exchange)
      const mxRecords = await dns.resolveMx(domain);
      
      if (!mxRecords || mxRecords.length === 0) {
        return {
          valid: false,
          reason: 'Domain email tidak memiliki mail server'
        };
      }
      
      return {
        valid: true,
        reason: 'Domain email valid',
        mxRecords: mxRecords.length
      };
      
    } catch (error) {
      // Common DNS errors
      if (error.code === 'ENOTFOUND') {
        return {
          valid: false,
          reason: 'Domain email tidak ditemukan'
        };
      }
      
      if (error.code === 'ENODATA') {
        return {
          valid: false,
          reason: 'Domain tidak memiliki mail server'
        };
      }
      
      return {
        valid: false,
        reason: 'Tidak dapat memverifikasi domain email'
      };
    }
  }
  
  /**
   * Complete email validation (Format + Domain)
   * @param {string} email - Email to validate
   * @returns {object} - Complete validation result
   */
  async validateComplete(email) {
    try {
      // Step 1: Format validation (instant)
      const formatResult = this.validateFormat(email);
      if (!formatResult.valid) {
        return {
          valid: false,
          step: 'format',
          reason: formatResult.reason,
          email: email
        };
      }
      
      // Step 2: Domain validation (1-3 seconds)
      const domainResult = await this.validateDomain(email);
      if (!domainResult.valid) {
        return {
          valid: false,
          step: 'domain',
          reason: domainResult.reason,
          email: email
        };
      }
      
      return {
        valid: true,
        step: 'complete',
        reason: 'Email valid dan dapat menerima email',
        email: email,
        domain_info: {
          mx_records: domainResult.mxRecords
        }
      };
      
    } catch (error) {
      return {
        valid: false,
        step: 'error',
        reason: 'Error during email validation',
        email: email,
        error: error.message
      };
    }
  }
  
  /**
   * Quick validation for high-traffic scenarios
   * Only format validation, skip DNS lookup
   * @param {string} email - Email to validate
   * @returns {object} - Quick validation result
   */
  validateQuick(email) {
    const result = this.validateFormat(email);
    return {
      ...result,
      mode: 'quick',
      note: 'Only format validation performed'
    };
  }
  
  /**
   * Validate multiple emails at once
   * @param {array} emails - Array of emails to validate
   * @returns {array} - Array of validation results
   */
  async validateBatch(emails) {
    const results = [];
    
    for (const email of emails) {
      const result = await this.validateComplete(email);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Get validation statistics
   * @param {array} validationResults - Array of validation results
   * @returns {object} - Statistics
   */
  getValidationStats(validationResults) {
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.valid).length;
    const invalid = total - valid;
    
    const failureReasons = {};
    validationResults
      .filter(r => !r.valid)
      .forEach(r => {
        failureReasons[r.step] = (failureReasons[r.step] || 0) + 1;
      });
    
    return {
      total,
      valid,
      invalid,
      success_rate: total > 0 ? ((valid / total) * 100).toFixed(2) + '%' : '0%',
      failure_breakdown: failureReasons
    };
  }
}

// Export singleton instance
module.exports = new EmailValidationService();
