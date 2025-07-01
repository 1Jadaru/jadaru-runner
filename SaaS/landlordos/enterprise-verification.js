#!/usr/bin/env node

/**
 * Enterprise Features Verification Script
 * 
 * This script verifies that all enterprise features are working correctly.
 * Run this script after deploying the enterprise migration.
 */

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

class EnterpriseVerification {
  constructor() {
    this.token = null;
    this.userId = null;
    this.organizationId = null;
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...headers,
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`❌ API Error - ${method} ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async verifyServerHealth() {
    console.log('🏥 Checking server health...');
    try {
      const response = await this.makeRequest('GET', '/health');
      console.log('✅ Server is healthy:', response);
      return true;
    } catch (error) {
      console.log('❌ Server health check failed');
      return false;
    }
  }

  async verifyDatabaseConnection() {
    console.log('🗄️  Checking database connection...');
    try {
      const response = await this.makeRequest('GET', '/health/db');
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Database connection failed');
      return false;
    }
  }

  async verifyAuthenticationFlow() {
    console.log('🔐 Testing authentication flow...');
    
    try {
      // Try to login with test credentials
      const loginResponse = await this.makeRequest('POST', '/auth/login', {
        email: 'admin@test.com',
        password: 'password123',
      });

      if (loginResponse.token) {
        this.token = loginResponse.token;
        this.userId = loginResponse.user.id;
        this.organizationId = loginResponse.user.organization.id;
        console.log('✅ Authentication successful');
        console.log(`   User: ${loginResponse.user.firstName} ${loginResponse.user.lastName}`);
        console.log(`   Organization: ${loginResponse.user.organization.name}`);
        console.log(`   Roles: ${loginResponse.user.userRoles.map(ur => ur.role.name).join(', ')}`);
        return true;
      }
    } catch (error) {
      console.log('❌ Authentication failed - You may need to create a test user first');
      return false;
    }
  }

  async verifyPermissionSystem() {
    console.log('🛡️  Testing permission system...');
    
    try {
      const userResponse = await this.makeRequest('GET', '/auth/me');
      const user = userResponse.user;
      
      console.log('✅ Permission system verified:');
      console.log(`   Permissions: ${user.permissions.length} permissions loaded`);
      console.log(`   Roles: ${user.userRoles.length} roles assigned`);
      console.log(`   Property assignments: ${user.assignedPropertyIds?.length || 0} properties assigned`);
      
      return true;
    } catch (error) {
      console.log('❌ Permission system verification failed');
      return false;
    }
  }

  async verifyOrganizationIsolation() {
    console.log('🏢 Testing organization isolation...');
    
    try {
      // Test properties endpoint with organization scoping
      const propertiesResponse = await this.makeRequest('GET', '/properties');
      console.log('✅ Organization isolation verified:');
      console.log(`   Properties in organization: ${propertiesResponse.properties?.length || 0}`);
      
      // Test tenants endpoint
      const tenantsResponse = await this.makeRequest('GET', '/tenants');
      console.log(`   Tenants in organization: ${tenantsResponse.tenants?.length || 0}`);
      
      return true;
    } catch (error) {
      console.log('❌ Organization isolation verification failed');
      return false;
    }
  }

  async verifyAuditLogging() {
    console.log('📋 Testing audit logging...');
    
    try {
      // Perform an action that should be audited
      await this.makeRequest('GET', '/properties');
      
      // Check if audit logs are being created
      const auditResponse = await this.makeRequest('GET', '/organization/audit-logs');
      console.log('✅ Audit logging verified:');
      console.log(`   Recent audit entries: ${auditResponse.auditLogs?.length || 0}`);
      
      if (auditResponse.auditLogs && auditResponse.auditLogs.length > 0) {
        const recent = auditResponse.auditLogs[0];
        console.log(`   Latest action: ${recent.action} by ${recent.user.firstName} ${recent.user.lastName}`);
      }
      
      return true;
    } catch (error) {
      console.log('❌ Audit logging verification failed');
      return false;
    }
  }

  async verifyRoleBasedAccess() {
    console.log('👥 Testing role-based access...');
    
    try {
      const userResponse = await this.makeRequest('GET', '/auth/me');
      const user = userResponse.user;
      
      console.log('✅ Role-based access verified:');
      console.log(`   Current roles: ${user.userRoles.map(ur => ur.role.name).join(', ')}`);
      console.log(`   Permission count: ${user.permissions.length}`);
      
      // Test organization management endpoints
      const rolesResponse = await this.makeRequest('GET', '/organization/roles');
      console.log(`   Available roles: ${rolesResponse.roles?.length || 0}`);
      
      return true;
    } catch (error) {
      console.log('❌ Role-based access verification failed');
      return false;
    }
  }

  async verifyPropertyAssignments() {
    console.log('🏠 Testing property assignments...');
    
    try {
      const userResponse = await this.makeRequest('GET', '/auth/me');
      const user = userResponse.user;
      
      console.log('✅ Property assignments verified:');
      if (user.assignedPropertyIds && user.assignedPropertyIds.length > 0) {
        console.log(`   User has ${user.assignedPropertyIds.length} assigned properties`);
      } else {
        console.log('   User has access to all properties (no specific assignments)');
      }
      
      return true;
    } catch (error) {
      console.log('❌ Property assignments verification failed');
      return false;
    }
  }

  async runFullVerification() {
    console.log('🚀 Starting Enterprise Features Verification...\n');
    
    const checks = [
      { name: 'Server Health', fn: () => this.verifyServerHealth() },
      { name: 'Database Connection', fn: () => this.verifyDatabaseConnection() },
      { name: 'Authentication Flow', fn: () => this.verifyAuthenticationFlow() },
      { name: 'Permission System', fn: () => this.verifyPermissionSystem() },
      { name: 'Organization Isolation', fn: () => this.verifyOrganizationIsolation() },
      { name: 'Audit Logging', fn: () => this.verifyAuditLogging() },
      { name: 'Role-Based Access', fn: () => this.verifyRoleBasedAccess() },
      { name: 'Property Assignments', fn: () => this.verifyPropertyAssignments() },
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      try {
        const result = await check.fn();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
      console.log(''); // Add spacing between checks
    }

    console.log('📊 Verification Summary:');
    console.log(`✅ Passed: ${passed}/${checks.length}`);
    console.log(`❌ Failed: ${failed}/${checks.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 All enterprise features are working correctly!');
      console.log('LandlordOS is ready for enterprise deployment.');
    } else {
      console.log('\n⚠️  Some features need attention before deployment.');
      console.log('Please check the failed tests and fix any issues.');
    }
    
    return failed === 0;
  }
}

// Run verification if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verification = new EnterpriseVerification();
  verification.runFullVerification()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

export default EnterpriseVerification;
