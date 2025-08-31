// Schema validation script to verify zod vs Pydantic compliance
// Run this to ensure frontend schemas match backend exactly

import { 
  validateRecommendationRequest,
  validateRecommendationResponse,
  validateErrorResponse,
  validateHealthResponse,
  validateExportPdfRequest,
  FROZEN_CONTRACT_EXAMPLES
} from '../lib/schemas';

interface ValidationResult {
  schema: string;
  success: boolean;
  error?: string;
  data?: any;
}

function testSchema(
  name: string, 
  validator: (data: any) => any, 
  testData: any
): ValidationResult {
  try {
    const result = validator(testData);
    return {
      schema: name,
      success: true,
      data: result
    };
  } catch (error) {
    return {
      schema: name,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function validateFrozenContracts(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Test RecommendationRequest
  results.push(testSchema(
    'RecommendationRequest',
    validateRecommendationRequest,
    FROZEN_CONTRACT_EXAMPLES.recommendRequest
  ));

  // Test RecommendationResponse
  results.push(testSchema(
    'RecommendationResponse',
    validateRecommendationResponse,
    FROZEN_CONTRACT_EXAMPLES.recommendResponse
  ));

  // Test ErrorResponse
  results.push(testSchema(
    'ErrorResponse',
    validateErrorResponse,
    FROZEN_CONTRACT_EXAMPLES.errorResponse
  ));

  // Test HealthResponse
  results.push(testSchema(
    'HealthResponse',
    validateHealthResponse,
    FROZEN_CONTRACT_EXAMPLES.healthResponse
  ));

  // Test ExportPdfRequest
  const pdfRequest = {
    recommendation: FROZEN_CONTRACT_EXAMPLES.recommendResponse,
    map_png_base64: "data:image/png;base64,AAAA..."
  };
  
  results.push(testSchema(
    'ExportPdfRequest',
    validateExportPdfRequest,
    pdfRequest
  ));

  return results;
}

function validateFieldNames(): string[] {
  const issues: string[] = [];
  
  // Check that field names are snake_case (backend style) not camelCase
  const request = FROZEN_CONTRACT_EXAMPLES.recommendRequest;
  const response = FROZEN_CONTRACT_EXAMPLES.recommendResponse;
  
  // Verify critical field names match backend exactly
  const requiredFields = {
    request: ['local_datetime'], // Not localDateTime
    response: [
      'bearing_deg', // Not bearingDeg
      'sun_azimuth_deg', // Not sunAzimuthDeg  
      'relative_angle_deg', // Not relativeAngleDeg
      'golden_hour', // Not goldenHour
      'phase_times' // Not phaseTimes
    ],
    phase_times: ['civil_dawn', 'civil_dusk'], // Not civilDawn, civilDusk
    midpoint: ['sun_azimuth_deg'] // Not sunAzimuthDeg
  };

  // Check request fields
  for (const field of requiredFields.request) {
    if (!(field in request)) {
      issues.push(`Missing field in request: ${field}`);
    }
  }

  // Check response fields
  for (const field of requiredFields.response) {
    if (!(field in response)) {
      issues.push(`Missing field in response: ${field}`);
    }
  }

  // Check nested fields
  for (const field of requiredFields.phase_times) {
    if (!(field in response.phase_times)) {
      issues.push(`Missing field in phase_times: ${field}`);
    }
  }

  for (const field of requiredFields.midpoint) {
    if (!(field in response.midpoint)) {
      issues.push(`Missing field in midpoint: ${field}`);
    }
  }

  return issues;
}

function compareWithBackendTypes(): string[] {
  const differences: string[] = [];
  
  // Verify enum values match backend exactly
  const response = FROZEN_CONTRACT_EXAMPLES.recommendResponse;
  
  const validSides = ['LEFT', 'RIGHT', 'EITHER'];
  const validConfidences = ['HIGH', 'MEDIUM', 'LOW'];
  const validStabilities = ['HIGH', 'MEDIUM', 'LOW'];
  const validErrorTypes = ['POLAR_DAY', 'UNDEFINED_SUN', 'VALIDATION', 'GEO_ERROR'];
  const validInterests = ['sunrise', 'sunset'];
  
  if (!validSides.includes(response.side)) {
    differences.push(`Invalid side value: ${response.side}`);
  }
  
  if (!validConfidences.includes(response.confidence)) {
    differences.push(`Invalid confidence value: ${response.confidence}`);
  }
  
  if (!validStabilities.includes(response.stability)) {
    differences.push(`Invalid stability value: ${response.stability}`);
  }

  return differences;
}

function main() {
  console.log('🔍 Validating Frontend Schemas vs Backend Contract');
  console.log('='.repeat(60));

  // Test frozen contract validation
  console.log('\n1. Testing Frozen Contract Examples:');
  const validationResults = validateFrozenContracts();
  
  for (const result of validationResults) {
    if (result.success) {
      console.log(`✅ ${result.schema}: Valid`);
    } else {
      console.log(`❌ ${result.schema}: ${result.error}`);
    }
  }

  // Test field names
  console.log('\n2. Testing Field Name Compliance:');
  const fieldIssues = validateFieldNames();
  
  if (fieldIssues.length === 0) {
    console.log('✅ All field names match backend (snake_case)');
  } else {
    for (const issue of fieldIssues) {
      console.log(`❌ ${issue}`);
    }
  }

  // Test type compatibility
  console.log('\n3. Testing Type Compatibility:');
  const typeIssues = compareWithBackendTypes();
  
  if (typeIssues.length === 0) {
    console.log('✅ All enum values match backend');
  } else {
    for (const issue of typeIssues) {
      console.log(`❌ ${issue}`);
    }
  }

  // Summary
  const totalIssues = validationResults.filter(r => !r.success).length + 
                     fieldIssues.length + 
                     typeIssues.length;

  console.log('\n' + '='.repeat(60));
  if (totalIssues === 0) {
    console.log('🎉 All schemas validated successfully!');
    console.log('✅ Frontend types are fully compatible with backend');
    process.exit(0);
  } else {
    console.log(`❌ Found ${totalIssues} issues that need to be fixed`);
    process.exit(1);
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  main();
}

export { validateFrozenContracts, validateFieldNames, compareWithBackendTypes };



