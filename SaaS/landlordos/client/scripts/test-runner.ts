#!/usr/bin/env node
/**
 * Comprehensive Test Runner for LandlordOS Frontend
 * 
 * This script runs different types of tests and generates reports
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

const REPORTS_DIR = 'coverage'
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`)
}

function runCommand(command: string, description: string) {
  log(`\n${COLORS.blue}${COLORS.bold}${description}${COLORS.reset}`)
  log(`Running: ${command}`)
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8' 
    })
    log(`${COLORS.green}✓ ${description} completed successfully${COLORS.reset}`)
    return true
  } catch (error) {
    log(`${COLORS.red}✗ ${description} failed${COLORS.reset}`)
    return false
  }
}

function ensureReportsDir() {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }
}

function runTestSuite() {
  log(`${COLORS.bold}${COLORS.blue}🧪 LandlordOS Frontend Test Suite${COLORS.reset}`)
  log('Starting comprehensive test execution...\n')

  ensureReportsDir()

  const results = {
    lint: false,
    typeCheck: false,
    unit: false,
    integration: false,
    coverage: false,
  }

  // 1. ESLint
  results.lint = runCommand(
    'npm run lint',
    '1. Running ESLint code quality checks'
  )

  // 2. TypeScript type checking
  results.typeCheck = runCommand(
    'npx tsc --noEmit',
    '2. Running TypeScript type checking'
  )

  // 3. Unit tests
  results.unit = runCommand(
    'npx vitest run --reporter=verbose',
    '3. Running unit tests'
  )

  // 4. Integration tests
  results.integration = runCommand(
    'npx vitest run --reporter=verbose src/test/__tests__/integration',
    '4. Running integration tests'
  )

  // 5. Coverage report
  results.coverage = runCommand(
    'npx vitest run --coverage',
    '5. Generating test coverage report'
  )

  // Summary
  log(`\n${COLORS.bold}${COLORS.blue}📊 Test Results Summary${COLORS.reset}`)
  log('════════════════════════════════')
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✓' : '✗'
    const color = passed ? COLORS.green : COLORS.red
    log(`${color}${icon} ${test.toUpperCase().padEnd(12)} ${passed ? 'PASSED' : 'FAILED'}${COLORS.reset}`)
  })

  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length
  const passRate = ((passedTests / totalTests) * 100).toFixed(1)

  log(`\n${COLORS.bold}Overall: ${passedTests}/${totalTests} tests passed (${passRate}%)${COLORS.reset}`)

  if (passedTests === totalTests) {
    log(`${COLORS.green}${COLORS.bold}🎉 All tests passed! Ready for deployment.${COLORS.reset}`)
    return 0
  } else {
    log(`${COLORS.red}${COLORS.bold}❌ Some tests failed. Please fix issues before deployment.${COLORS.reset}`)
    return 1
  }
}

// Handle command line arguments
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  log(`${COLORS.bold}LandlordOS Frontend Test Runner${COLORS.reset}`)
  log('\nUsage:')
  log('  npm run test:all           Run all tests')
  log('  npm run test:unit          Run unit tests only')
  log('  npm run test:integration   Run integration tests only')
  log('  npm run test:watch         Run tests in watch mode')
  log('  npm run test:coverage      Run tests with coverage')
  log('  npm run test:ui            Run tests with UI')
  log('\nOptions:')
  log('  --help, -h                 Show this help message')
  process.exit(0)
}

if (args.includes('--unit-only')) {
  runCommand('npx vitest run src/test/__tests__/components src/test/__tests__/hooks src/test/__tests__/utils', 'Running unit tests only')
  process.exit(0)
}

if (args.includes('--integration-only')) {
  runCommand('npx vitest run src/test/__tests__/integration', 'Running integration tests only')
  process.exit(0)
}

// Run full test suite
const exitCode = runTestSuite()
process.exit(exitCode)
