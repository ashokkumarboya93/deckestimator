/**
 * Deck Estimator — Complete API Manual Testing Guide Compiler
 * Assembles all 7 sections and writes docs/API-Manual-Testing-Guide.md
 */

const fs = require('fs');
const path = require('path');

const getSection1 = require('./guide-data/section1-setup');
const getSection2Phase1To4 = require('./guide-data/section2-phase1-4');
const getSection2Phase5To6 = require('./guide-data/section2-phase5-6');
const getSection2Phase7To8 = require('./guide-data/section2-phase7-8');
const getSection2Phase9To10 = require('./guide-data/section2-phase9-10');
const getSection2Phase11To12 = require('./guide-data/section2-phase11-12');
const getSection3Workflows = require('./guide-data/section3-workflows');
const getSection4RoleMatrix = require('./guide-data/section4-role-matrix');
const getSection5FilesAI = require('./guide-data/section5-files-ai');
const getSection6Checklist = require('./guide-data/section6-checklist');
const getSection7MissingAnalysis = require('./guide-data/section7-missing-analysis');

const targetPath = path.resolve(__dirname, '../../docs/API-Manual-Testing-Guide.md');

console.log('Compiling Master API Manual Testing Guide...');

let fullDocument = '';

// Title & Metadata
fullDocument += `# Deck Estimator — Complete Phase-Wise API Manual Testing Guide\n\n`;
fullDocument += `> **Application:** Deck Estimator Platform (RESTful API v1)  \n`;
fullDocument += `> **Active Branch:** \`dev2\`  \n`;
fullDocument += `> **Target Audience:** Manual QA Testers, Postman Engineers, and Developers  \n`;
fullDocument += `> **Backend Base URL:** \`http://localhost:5000\`  \n`;
fullDocument += `> **API Base URL:** \`http://localhost:5000/api/v1\`  \n`;
fullDocument += `> **Database:** MongoDB Atlas (\`DECK_ESTIMATOR\`)  \n`;
fullDocument += `> **Generated Date:** November 2026  \n\n`;
fullDocument += `---\n\n`;

// Table of Contents
fullDocument += `## Table of Contents\n\n`;
fullDocument += `1. [Section 1: Testing Environment Setup & Postman Configuration](#section-1-testing-environment-setup--postman-configuration)\n`;
fullDocument += `2. [Section 2: Phase-Wise API Catalog & Manual Testing Specifications](#section-2-phase-wise-api-catalog--manual-testing-specifications)\n`;
fullDocument += `   - [Phase 1: Requirements Analysis & Architecture](#phase-1-project-inspection-requirements-analysis-and-architecture)\n`;
fullDocument += `   - [Phase 2: Backend Foundation & Telemetry](#phase-2-project-structure-application-skeleton-and-backend-foundation)\n`;
fullDocument += `   - [Phase 3: Authentication and Authorization](#phase-3-authentication-and-authorization)\n`;
fullDocument += `   - [Phase 4: Deck Input Management and Secure File Uploads](#phase-4-deck-input-management-and-secure-file-uploads)\n`;
fullDocument += `   - [Phase 5: Material and Service Catalog Management](#phase-5-material-and-service-catalog-management)\n`;
fullDocument += `   - [Phase 6: Pricing Calculation Engine and Estimate Management](#phase-6-pricing-calculation-engine-and-estimate-management)\n`;
fullDocument += `   - [Phase 7: AI-Based Deck Condition Analysis](#phase-7-ai-based-deck-condition-analysis)\n`;
fullDocument += `   - [Phase 8: Contractor Verification and Lead Management](#phase-8-contractor-verification-and-lead-management)\n`;
fullDocument += `   - [Phase 9: Contractor Discounts and Commission Management](#phase-9-contractor-discounts-and-commission-management)\n`;
fullDocument += `   - [Phase 10: Administrative Dashboard and Platform Management](#phase-10-administrative-dashboard-and-platform-management)\n`;
fullDocument += `   - [Phase 11: Integration, Security and Quality Assurance](#phase-11-integration-security-and-quality-assurance)\n`;
fullDocument += `   - [Phase 12: Deployment, Documentation and Production Readiness](#phase-12-deployment-documentation-and-production-readiness)\n`;
fullDocument += `3. [Section 3: Phase-Wise Workflow Dependencies & Testing Sequences](#section-3-phase-wise-workflow-dependencies--testing-sequences)\n`;
fullDocument += `4. [Section 4: Role-Based API Testing Matrix](#section-4-role-based-api-testing-matrix)\n`;
fullDocument += `5. [Section 5: File Uploads & AI Condition Analysis Testing Guide](#section-5-file-uploads--ai-condition-analysis-testing-guide)\n`;
fullDocument += `6. [Section 6: Complete API Testing Checklist](#section-6-complete-api-testing-checklist)\n`;
fullDocument += `7. [Section 7: Missing, Planned & Incomplete API Analysis](#section-7-missing-planned--incomplete-api-analysis)\n\n`;
fullDocument += `---\n\n`;

// Append Sections
fullDocument += getSection1() + '\n\n';
fullDocument += getSection2Phase1To4() + '\n\n';
fullDocument += getSection2Phase5To6() + '\n\n';
fullDocument += getSection2Phase7To8() + '\n\n';
fullDocument += getSection2Phase9To10() + '\n\n';
fullDocument += getSection2Phase11To12() + '\n\n';
fullDocument += getSection3Workflows() + '\n\n';
fullDocument += getSection4RoleMatrix() + '\n\n';
fullDocument += getSection5FilesAI() + '\n\n';
fullDocument += getSection6Checklist() + '\n\n';
fullDocument += getSection7MissingAnalysis() + '\n';

fs.writeFileSync(targetPath, fullDocument, 'utf8');

console.log('Successfully generated docs/API-Manual-Testing-Guide.md');
console.log('File size in bytes:', fs.statSync(targetPath).size);
console.log('Line count:', fullDocument.split('\n').length);
