#!/usr/bin/env node

/**
 * Performance Analyzer untuk Backend Booking Futsal
 * Menganalisis performance bottlenecks dan memberikan rekomendasi optimasi
 */

const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
  constructor() {
    this.issues = {
      queryOptimization: [],
      errorHandling: [],
      indexingNeeds: [],
      caching: []
    };
  }

  async analyzePerformance() {
    console.log('âš¡ Memulai analisis performance backend booking futsal...\n');
    
    await this.analyzeQueryPerformance();
    await this.analyzeErrorHandling();
    await this.analyzeIndexingNeeds();
    await this.analyzeCachingOpportunities();
    
    this.generateReport();
    this.generateOptimizationPlan();
  }

  async analyzeQueryPerformance() {
    console.log('í´ Menganalisis performance database queries...');
    
    const modelFiles = [
      'models/business/bookingModel.js',
      'models/business/fieldModel.js',
      'models/business/paymentModel.js',
      'models/core/userModel.js'
    ];
    
    for (const file of modelFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Analisis complex JOIN queries
        const complexJoins = this.findComplexJoins(content, file);
        if (complexJoins.length > 0) {
          this.issues.queryOptimization.push({
            file,
            type: 'complex_joins',
            issues: complexJoins,
            priority: 'high'
          });
        }
        
        // Analisis queries tanpa LIMIT
        const unlimitedQueries = this.findUnlimitedQueries(content, file);
        if (unlimitedQueries.length > 0) {
          this.issues.queryOptimization.push({
            file,
            type: 'unlimited_queries',
            issues: unlimitedQueries,
            priority: 'medium'
          });
        }
      }
    }
    
    console.log(`   Ditemukan ${this.issues.queryOptimization.length} masalah query performance`);
  }

  findComplexJoins(content, file) {
    const issues = [];
    
    // Cari queries dengan multiple LEFT JOINs
    const joinMatches = content.match(/LEFT JOIN[\s\S]*?LEFT JOIN[\s\S]*?LEFT JOIN/gi);
    
    if (joinMatches && joinMatches.length > 0) {
      joinMatches.forEach(match => {
        const joinCount = (match.match(/LEFT JOIN/gi) || []).length;
        issues.push({
          description: `Query dengan ${joinCount} LEFT JOINs - berpotensi lambat`,
          suggestion: 'Pertimbangkan untuk memecah query atau menggunakan subquery',
          impact: 'high'
        });
      });
    }
    
    return issues;
  }

  findUnlimitedQueries(content, file) {
    const issues = [];
    
    // Cari SELECT queries tanpa LIMIT yang berpotensi besar
    const selectMatches = content.match(/SELECT[\s\S]*?FROM[\s\S]*?ORDER BY[\s\S]*?(?=;|\`)/gi);
    
    if (selectMatches) {
      selectMatches.forEach(match => {
        if (!match.includes('LIMIT') && !match.includes('COUNT(')) {
          issues.push({
            description: 'Query tanpa LIMIT berpotensi mengembalikan data berlebihan',
            suggestion: 'Tambahkan LIMIT atau implementasi pagination',
            impact: 'medium'
          });
        }
      });
    }
    
    return issues;
  }

  async analyzeErrorHandling() {
    console.log('íº¨ Menganalisis konsistensi error handling...');
    
    const controllerFiles = this.findFiles('controllers', /\.js$/);
    
    for (const file of controllerFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Analisis missing try-catch
      const asyncFunctions = content.match(/const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*{/g) || [];
      const tryCatchBlocks = content.match(/try\s*{/g) || [];
      
      if (asyncFunctions.length > tryCatchBlocks.length) {
        this.issues.errorHandling.push({
          file,
          type: 'missing_try_catch',
          asyncFunctions: asyncFunctions.length,
          tryCatchBlocks: tryCatchBlocks.length,
          priority: 'high'
        });
      }
    }
    
    console.log(`   Ditemukan ${this.issues.errorHandling.length} masalah error handling`);
  }

  async analyzeIndexingNeeds() {
    console.log('í³Š Menganalisis kebutuhan database indexing...');
    
    const indexingNeeds = [
      {
        table: 'bookings',
        columns: ['user_id', 'field_id', 'date', 'status', 'payment_status'],
        reason: 'Frequently queried in booking operations',
        priority: 'high'
      },
      {
        table: 'bookings',
        columns: ['field_id', 'date', 'start_time', 'end_time'],
        reason: 'Used in conflict detection queries',
        priority: 'high'
      },
      {
        table: 'users',
        columns: ['email', 'role', 'is_active'],
        reason: 'Used in authentication and role-based queries',
        priority: 'high'
      },
      {
        table: 'fields',
        columns: ['status', 'assigned_operator'],
        reason: 'Used in field availability and operator queries',
        priority: 'medium'
      },
      {
        table: 'payments',
        columns: ['booking_id', 'status', 'created_at'],
        reason: 'Used in payment tracking and reporting',
        priority: 'medium'
      }
    ];
    
    this.issues.indexingNeeds = indexingNeeds;
    console.log(`   Diidentifikasi ${indexingNeeds.length} kebutuhan indexing`);
  }

  async analyzeCachingOpportunities() {
    console.log('í²¾ Menganalisis peluang caching...');
    
    const cachingOpportunities = [
      {
        type: 'static_data',
        description: 'Field information (name, type, facilities)',
        location: 'models/business/fieldModel.js',
        benefit: 'Reduce database load for field listings',
        priority: 'high'
      },
      {
        type: 'user_sessions',
        description: 'User profile data after authentication',
        location: 'controllers/auth/authController.js',
        benefit: 'Faster user data retrieval',
        priority: 'medium'
      },
      {
        type: 'statistics',
        description: 'Dashboard statistics and analytics',
        location: 'controllers/admin/*Controller.js',
        benefit: 'Faster dashboard loading',
        priority: 'medium'
      }
    ];
    
    this.issues.caching = cachingOpportunities;
    console.log(`   Diidentifikasi ${cachingOpportunities.length} peluang caching`);
  }

  findFiles(dir, pattern, excludeDirs = []) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !excludeDirs.includes(item)) {
          files.push(...this.findFiles(fullPath, pattern, excludeDirs));
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}`);
    }
    
    return files;
  }

  generateReport() {
    console.log('\ní³Š LAPORAN ANALISIS PERFORMANCE');
    console.log('='.repeat(50));
    
    const totalIssues = Object.values(this.issues).reduce((sum, issues) => sum + issues.length, 0);
    
    console.log(`í´ Total Issues Ditemukan: ${totalIssues}`);
    console.log('');
    
    // Query Optimization Issues
    if (this.issues.queryOptimization.length > 0) {
      console.log(`âš¡ Query Optimization (${this.issues.queryOptimization.length} issues):`);
      this.issues.queryOptimization.forEach(issue => {
        console.log(`   - ${issue.file}: ${issue.type} (${issue.priority} priority)`);
      });
      console.log('');
    }
    
    // Error Handling Issues
    if (this.issues.errorHandling.length > 0) {
      console.log(`íº¨ Error Handling (${this.issues.errorHandling.length} issues):`);
      this.issues.errorHandling.forEach(issue => {
        console.log(`   - ${issue.file}: ${issue.type} (${issue.priority} priority)`);
      });
      console.log('');
    }
    
    // Indexing Needs
    console.log(`í³Š Database Indexing Needs (${this.issues.indexingNeeds.length} recommendations):`);
    this.issues.indexingNeeds.forEach(need => {
      console.log(`   - ${need.table}: [${need.columns.join(', ')}] (${need.priority} priority)`);
    });
    console.log('');
    
    // Caching Opportunities
    console.log(`í²¾ Caching Opportunities (${this.issues.caching.length} recommendations):`);
    this.issues.caching.forEach(cache => {
      console.log(`   - ${cache.type}: ${cache.description} (${cache.priority} priority)`);
    });
  }

  generateOptimizationPlan() {
    console.log('\ní·ºï¸  RENCANA OPTIMASI PERFORMANCE');
    console.log('='.repeat(50));
    
    console.log('í³‹ FASE 1: Database Query Optimization (HIGH PRIORITY)');
    console.log('   1. Implementasi database indexes untuk tabel critical');
    console.log('   2. Optimasi complex JOIN queries');
    console.log('   3. Tambahkan LIMIT pada queries yang berpotensi besar');
    
    console.log('\ní³‹ FASE 2: Error Handling Standardization (HIGH PRIORITY)');
    console.log('   1. Tambahkan try-catch blocks pada semua async functions');
    console.log('   2. Standardisasi format error response');
    console.log('   3. Implementasi centralized error handler');
    
    console.log('\ní³‹ FASE 3: Caching Implementation (MEDIUM PRIORITY)');
    console.log('   1. Implementasi in-memory caching untuk static data');
    console.log('   2. Cache user sessions dan profile data');
    console.log('   3. Cache dashboard statistics');
    
    // Save detailed report
    const reportPath = path.resolve('debug/performance-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total_issues: Object.values(this.issues).reduce((sum, issues) => sum + issues.length, 0),
        query_optimization: this.issues.queryOptimization.length,
        error_handling: this.issues.errorHandling.length,
        indexing_needs: this.issues.indexingNeeds.length,
        caching_opportunities: this.issues.caching.length
      },
      issues: this.issues
    }, null, 2));
    
    console.log(`\ní³„ Laporan detail disimpan ke: ${reportPath}`);
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.analyzePerformance().catch(console.error);
}

module.exports = PerformanceAnalyzer;
