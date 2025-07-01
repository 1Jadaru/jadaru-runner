# LandlordOS - Manual Testing Plan

## 📋 Overview
This document provides step-by-step manual testing procedures for all LandlordOS features. Use this guide to verify functionality before releases and after major changes.

## 🚀 Prerequisites

### Environment Setup
1. **Backend Server**: http://localhost:5000 (running)
2. **Frontend Server**: http://localhost:5173 (running)
3. **Database**: PostgreSQL connected via Prisma
4. **Test Browser**: Chrome, Firefox, or Edge (latest versions)

### Test Data Setup
```powershell
# Create test user if needed
$registerBody = @{ 
    firstName = "Test"
    lastName = "User"
    email = "testuser@example.com"
    password = "password123" 
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -Headers $headers
```

---

## 🔐 Authentication Testing

### TC-AUTH-001: User Registration
**Objective**: Verify new user can register successfully

**Steps**:
1. Navigate to http://localhost:5173
2. Click "Register" or "Sign Up"
3. Fill in registration form:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "newuser@test.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Register" button

**Expected Result**: 
- ✅ User successfully registered
- ✅ Redirected to dashboard
- ✅ Navigation shows user is logged in

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-AUTH-002: User Login
**Objective**: Verify existing user can login successfully

**Steps**:
1. Navigate to http://localhost:5173
2. Click "Login" or "Sign In"
3. Enter credentials:
   - Email: "testuser@example.com"
   - Password: "password123"
4. Click "Login" button

**Expected Result**:
- ✅ User successfully logged in
- ✅ Redirected to dashboard
- ✅ JWT token stored in localStorage

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-AUTH-003: User Logout
**Objective**: Verify user can logout successfully

**Steps**:
1. While logged in, click user menu or logout button
2. Click "Logout"

**Expected Result**:
- ✅ User logged out
- ✅ Redirected to login page
- ✅ JWT token removed from localStorage

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

## 🏠 Properties CRUD Testing

### TC-PROP-001: View Properties List
**Objective**: Verify user can view their properties

**Steps**:
1. Login to application
2. Navigate to "Properties" page
3. Observe the properties list

**Expected Result**:
- ✅ Properties page loads without errors
- ✅ Properties displayed in card format
- ✅ Shows property address, city, state, type
- ✅ Shows edit and delete buttons for each property
- ✅ Shows "Add Property" button

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-PROP-002: Create New Property
**Objective**: Verify user can create a new property

**Steps**:
1. On Properties page, click "Add Property" button
2. Fill in the form with test data:
   - Address: "123 Test Street"
   - City: "Test City"
   - State: "CA"
   - Zip Code: "12345"
   - Property Type: "Single Family"
   - Bedrooms: 3
   - Bathrooms: 2
   - Square Feet: 1500
   - Purchase Price: 300000
   - Current Value: 350000
   - Mortgage: 250000
3. Click "Create Property" button

**Expected Result**:
- ✅ Form submits without errors
- ✅ Success message or feedback shown
- ✅ New property appears in properties list
- ✅ Form closes/resets after creation
- ✅ Dashboard stats update (if applicable)

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-PROP-003: Edit Existing Property
**Objective**: Verify user can edit an existing property

**Steps**:
1. On Properties page, locate a test property
2. Click the edit (pencil) icon for that property
3. Verify form is pre-populated with existing data
4. Make changes to some fields:
   - Change Address to "456 Updated Avenue"
   - Change City to "Updated City"
   - Change Bedrooms to 4
5. Click "Update Property" button

**Expected Result**:
- ✅ Edit form opens with pre-populated data
- ✅ Form title shows "Edit Property"
- ✅ Button shows "Update Property"
- ✅ Changes save successfully
- ✅ Updated data appears in properties list
- ✅ Form closes after update

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-PROP-004: Delete Property
**Objective**: Verify user can delete a property

**Steps**:
1. On Properties page, locate a test property
2. Click the delete (trash) icon for that property
3. Confirm deletion in the popup dialog
4. Verify property is removed

**Expected Result**:
- ✅ Confirmation dialog appears
- ✅ Property is removed from list after confirmation
- ✅ No errors displayed
- ✅ Dashboard stats update (if applicable)

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-PROP-005: Property Form Validation
**Objective**: Verify form validation works correctly

**Steps**:
1. Click "Add Property" button
2. Try to submit form with empty required fields
3. Try to submit with invalid data:
   - State: "ABC" (should be 2 characters)
   - Zip Code: "123" (should be 5+ characters)
   - Bedrooms: -1 (should be non-negative)

**Expected Result**:
- ✅ Form prevents submission with empty required fields
- ✅ Validation errors displayed for invalid data
- ✅ Error messages are clear and helpful
- ✅ Form highlights invalid fields

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

## 📊 Dashboard Testing

### TC-DASH-001: Dashboard Overview
**Objective**: Verify dashboard displays correct information

**Steps**:
1. Login and navigate to Dashboard (home page)
2. Review displayed statistics and information

**Expected Result**:
- ✅ Dashboard loads without errors
- ✅ Shows total properties count
- ✅ Shows total tenants count (if implemented)
- ✅ Shows recent activity or quick actions
- ✅ Data is accurate and up-to-date

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

## 🔧 Navigation & UI Testing

### TC-NAV-001: Navigation Between Pages
**Objective**: Verify navigation works correctly

**Steps**:
1. Test clicking each navigation menu item
2. Verify page loads and URL changes correctly
3. Test browser back/forward buttons

**Expected Result**:
- ✅ All navigation links work
- ✅ URLs update correctly
- ✅ Browser navigation works
- ✅ No broken links or 404 errors

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-UI-001: Responsive Design
**Objective**: Verify UI works on different screen sizes

**Steps**:
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Use browser dev tools to test different sizes

**Expected Result**:
- ✅ UI adapts to different screen sizes
- ✅ All functionality accessible on mobile
- ✅ Text remains readable
- ✅ Buttons and forms are usable

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

## 🐛 Error Handling Testing

### TC-ERR-001: Network Error Handling
**Objective**: Verify app handles network errors gracefully

**Steps**:
1. Stop the backend server
2. Try to perform actions that require API calls
3. Restart the backend server

**Expected Result**:
- ✅ Appropriate error messages displayed
- ✅ App doesn't crash or become unusable
- ✅ Functionality resumes when server is back
- ✅ Loading states handled correctly

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-ERR-002: Authentication Errors
**Objective**: Verify authentication error handling

**Steps**:
1. Login normally
2. Wait for JWT token to expire or manually clear it
3. Try to access protected pages

**Expected Result**:
- ✅ User redirected to login page
- ✅ Appropriate error message shown
- ✅ Can login again successfully

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

## 🧪 API Testing (PowerShell)

### Prerequisites for API Testing
```powershell
# Get authentication token
$loginBody = @{ 
    email = "testuser@example.com"
    password = "password123" 
} | ConvertTo-Json

$loginHeaders = @{ "Content-Type" = "application/json" }
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -Headers $loginHeaders
$token = $loginResponse.token

$headers = @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json" 
}
```

### TC-API-001: Properties CRUD API
**Objective**: Verify all Properties API endpoints work correctly

**Create Property**:
```powershell
$propertyBody = @{
    address = "123 API Test Street"
    city = "API City"
    state = "TX"
    zipCode = "54321"
    type = "CONDO"
    bedrooms = 2
    bathrooms = 1
    squareFeet = 1000
    purchasePrice = 200000
    currentValue = 250000
    mortgage = 150000
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties" -Method POST -Body $propertyBody -Headers $headers
$propertyId = $createResponse.property.id
```

**Read Properties**:
```powershell
$getResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties" -Method GET -Headers $headers
$getResponse.properties | Select-Object id, address, city, type
```

**Update Property**:
```powershell
$updateBody = @{
    address = "456 Updated API Street"
    bedrooms = 3
    currentValue = 275000
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId" -Method PUT -Body $updateBody -Headers $headers
```

**Delete Property**:
```powershell
$deleteResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId" -Method DELETE -Headers $headers
```

**Expected Results**: All operations complete successfully with appropriate HTTP status codes and response data.

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-API-002: Tenants CRUD API
**Objective**: Verify all Tenants API endpoints work correctly

**Create Tenant**:
```powershell
$tenantBody = @{
    firstName = "John"
    lastName = "Doe"
    email = "john.doe@test.com"
    phone = "555-123-4567"
    emergencyContact = "Jane Doe"
    emergencyPhone = "555-987-6543"
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/tenants" -Method POST -Body $tenantBody -Headers $headers
$tenantId = $createResponse.tenant.id
```

**Read Tenants**:
```powershell
$getResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/tenants" -Method GET -Headers $headers
$getResponse.tenants | Select-Object id, firstName, lastName, email, isActive
```

**Update Tenant**:
```powershell
$updateBody = @{
    firstName = "Johnny"
    phone = "555-999-8888"
    emergencyContact = "Mary Doe"
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/tenants/$tenantId" -Method PUT -Body $updateBody -Headers $headers
```

**Delete Tenant**:
```powershell
$deleteResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/tenants/$tenantId" -Method DELETE -Headers $headers
```

**Expected Results**: All operations complete successfully with appropriate HTTP status codes and response data.

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-API-003: Leases CRUD API
**Objective**: Verify all Leases API endpoints work correctly

**Create Lease**:
```powershell
$leaseBody = @{
    propertyId = "property-id-here"
    tenantId = "tenant-id-here"
    startDate = "2025-01-01T00:00:00Z"
    endDate = "2025-12-31T23:59:59Z"
    monthlyRent = 1800
    securityDeposit = 1800
    status = "ACTIVE"
    terms = "No pets allowed. Rent due on the 1st of each month."
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/leases" -Method POST -Body $leaseBody -Headers $headers
$leaseId = $createResponse.lease.id
```

**Read Leases**:
```powershell
$getResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/leases" -Method GET -Headers $headers
$getResponse.leases | Select-Object id, tenantName, propertyAddress, monthlyRent, status
```

**Update Lease**:
```powershell
$updateBody = @{
    monthlyRent = 1950
    securityDeposit = 1950
    terms = "Updated lease terms"
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/leases/$leaseId" -Method PUT -Body $updateBody -Headers $headers
```

**Delete Lease**:
```powershell
$deleteResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/leases/$leaseId" -Method DELETE -Headers $headers
```

**Expected Results**: All operations complete successfully with appropriate HTTP status codes and response data.

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

## 📋 Leases CRUD Testing

### TC-LEASE-001: View Leases List
**Objective**: Verify user can view their leases

**Steps**:
1. Login to application
2. Navigate to "Leases" page
3. Observe the leases list

**Expected Result**:
- ✅ Leases page loads without errors
- ✅ Leases displayed in card format
- ✅ Shows lease status (Active/Expired/Terminated)
- ✅ Shows property address and tenant name
- ✅ Shows monthly rent and lease dates
- ✅ Shows edit and delete buttons for each lease
- ✅ Shows "Add Lease" button

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-LEASE-002: Create New Lease
**Objective**: Verify user can create a new lease

**Steps**:
1. On Leases page, click "Add Lease" button
2. Fill in the form with test data:
   - Property: Select an available property
   - Tenant: Select an available tenant
   - Start Date: "2025-01-01"
   - End Date: "2025-12-31"
   - Monthly Rent: 1800
   - Security Deposit: 1800
   - Status: "Active"
   - Terms: "Sample lease terms"
3. Click "Create Lease" button

**Expected Result**:
- ✅ Form submits without errors
- ✅ Property and tenant dropdowns populated
- ✅ Date validation works correctly
- ✅ New lease appears in leases list
- ✅ Form closes/resets after creation
- ✅ Dashboard stats update (if applicable)

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-LEASE-003: Edit Existing Lease
**Objective**: Verify user can edit an existing lease

**Steps**:
1. On Leases page, locate a test lease
2. Click the edit (pencil) icon for that lease
3. Verify form is pre-populated with existing data
4. Make changes to some fields:
   - Change Monthly Rent to 1950
   - Change Security Deposit to 1950
   - Update Terms field
5. Click "Update Lease" button

**Expected Result**:
- ✅ Edit form opens with pre-populated data
- ✅ Form title shows "Edit Lease"
- ✅ Button shows "Update Lease"
- ✅ Changes save successfully
- ✅ Updated data appears in leases list
- ✅ Form closes after update

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-LEASE-004: Delete Lease
**Objective**: Verify user can delete a lease

**Steps**:
1. On Leases page, locate a test lease (ensure no payments associated)
2. Click the delete (trash) icon for that lease
3. Confirm deletion in the popup dialog
4. Verify lease is removed

**Expected Result**:
- ✅ Confirmation dialog appears
- ✅ Lease is removed from list after confirmation
- ✅ No errors displayed
- ✅ Dashboard stats update (if applicable)

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-LEASE-005: Lease Form Validation
**Objective**: Verify form validation works correctly

**Steps**:
1. Click "Add Lease" button
2. Try to submit form with empty required fields
3. Try to submit with invalid data:
   - End Date before Start Date
   - Negative rent amount
   - Missing property or tenant selection

**Expected Result**:
- ✅ Form prevents submission with empty required fields
- ✅ Validation errors displayed for invalid data
- ✅ Error messages are clear and helpful
- ✅ Form highlights invalid fields

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-LEASE-006: Business Logic Validation
**Objective**: Verify business rules are enforced

**Steps**:
1. Try to create overlapping leases for the same property
2. Try to delete lease with associated payments (if payment system exists)
3. Verify lease status affects tenant status

**Expected Result**:
- ✅ System prevents overlapping active leases
- ✅ Clear error messages for business rule violations
- ✅ Proper validation of lease relationships

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

### TC-LEASE-007: Lease Expiry Warning
**Objective**: Verify system shows warnings for expiring leases

**Steps**:
1. Create or view lease expiring within 30 days
2. Observe lease card display

**Expected Result**:
- ✅ Warning indicator shown for leases expiring soon
- ✅ Days until expiry clearly displayed
- ✅ Visual distinction for expired leases

**Status**: [ ] Pass [ ] Fail [ ] Not Tested

---

## 📝 Test Execution Log

| Test ID | Date | Tester | Status | Notes |
|---------|------|--------|--------|-------|
| TC-AUTH-001 | YYYY-MM-DD | [Name] | [ ] Pass/Fail | |
| TC-AUTH-002 | YYYY-MM-DD | [Name] | [ ] Pass/Fail | |
| TC-PROP-001 | YYYY-MM-DD | [Name] | [ ] Pass/Fail | |
| TC-PROP-002 | YYYY-MM-DD | [Name] | [ ] Pass/Fail | |
| TC-PROP-003 | YYYY-MM-DD | [Name] | [ ] Pass/Fail | |
| ... | ... | ... | ... | ... |

---

## 🚀 Release Testing Checklist

Before any release, ensure the following critical paths are tested:

### Core User Journey
- [ ] User can register new account
- [ ] User can login with existing account
- [ ] User can view dashboard
- [ ] User can create a new property
- [ ] User can edit an existing property
- [ ] User can delete a property
- [ ] User can create a new tenant
- [ ] User can edit an existing tenant
- [ ] User can delete a tenant
- [ ] User can create a new lease
- [ ] User can edit an existing lease
- [ ] User can delete a lease
- [ ] User can logout successfully

### Data Integrity
- [ ] All CRUD operations save data correctly
- [ ] Form validation prevents invalid data
- [ ] Dashboard stats reflect accurate data
- [ ] No data loss during operations

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Authentication errors redirect properly
- [ ] Form errors display helpful messages
- [ ] App recovers from errors correctly

### Performance
- [ ] Pages load within acceptable time
- [ ] API responses are fast
- [ ] No memory leaks during navigation
- [ ] UI remains responsive during operations

---

## 🔮 Future Test Cases (To be added as features develop)

### Tenants Management
- [ ] Create/Read/Update/Delete tenants
- [ ] Assign tenants to properties
- [ ] Tenant contact information management

### Leases Management
- [ ] Create lease agreements
- [ ] Track lease start/end dates
- [ ] Lease renewal notifications

### Financial Tracking
- [ ] Record income and expenses
- [ ] Generate financial reports
- [ ] File upload for receipts

### Maintenance Tracking
- [ ] Create maintenance tasks
- [ ] Assign tasks to vendors
- [ ] Track task completion

---

**Document Version**: 1.0  
**Last Updated**: June 19, 2025  
**Next Review**: After next major feature release
