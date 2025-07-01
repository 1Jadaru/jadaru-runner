# Properties CRUD Testing Guide

This guide demonstrates how to test the full CRUD (Create, Read, Update, Delete) operations for Properties in LandlordOS.

## Backend API Testing (via PowerShell)

### 1. Login to get JWT token
```powershell
$loginBody = @{ 
    email = "testuser@example.com"; 
    password = "password123" 
} | ConvertTo-Json

$loginHeaders = @{ "Content-Type" = "application/json" }

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -Headers $loginHeaders

$token = $loginResponse.token
$headers = @{ 
    "Authorization" = "Bearer $token"; 
    "Content-Type" = "application/json" 
}
```

### 2. Create Property (CREATE)
```powershell
$propertyBody = @{
    address = "123 Test Street"
    city = "Test City"
    state = "CA"
    zipCode = "12345"
    type = "SINGLE_FAMILY"
    bedrooms = 3
    bathrooms = 2
    squareFeet = 1500
    purchasePrice = 300000
    currentValue = 350000
    mortgage = 250000
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties" -Method POST -Body $propertyBody -Headers $headers

$propertyId = $createResponse.property.id
Write-Host "Created Property ID: $propertyId"
```

### 3. Read Properties (READ)
```powershell
$getResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties" -Method GET -Headers $headers
$getResponse | ConvertTo-Json -Depth 3
```

### 4. Update Property (UPDATE)
```powershell
$updateBody = @{
    address = "456 Updated Avenue"
    city = "Updated City"
    state = "NY"
    zipCode = "54321"
    type = "CONDO"
    bedrooms = 4
    bathrooms = 3
    squareFeet = 2000
    currentValue = 400000
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId" -Method PUT -Body $updateBody -Headers $headers
Write-Host "Property updated successfully!"
```

### 5. Delete Property (DELETE)
```powershell
$deleteResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId" -Method DELETE -Headers $headers
Write-Host "Property deleted successfully!"
```

## Frontend UI Testing

### Prerequisites
1. Backend server running on http://localhost:5000
2. Frontend server running on http://localhost:5173
3. User account created (register via UI or API)

### Testing Steps

1. **Login**
   - Navigate to http://localhost:5173
   - Login with your credentials

2. **Read Properties**
   - Navigate to Properties page
   - View existing properties in card format

3. **Create Property**
   - Click "Add Property" button
   - Fill out the form with property details
   - Click "Create Property"
   - Verify property appears in the list

4. **Update Property**
   - Click the Edit (pencil) icon on any property card
   - Modify the property details in the form
   - Click "Update Property"
   - Verify changes are reflected in the property card

5. **Delete Property**
   - Click the Delete (trash) icon on any property card
   - Confirm deletion in the popup
   - Verify property is removed from the list

## Features Implemented

### Backend (server/src/routes/properties.js)
- ✅ GET /properties - List all properties with pagination and search
- ✅ GET /properties/:id - Get single property with details
- ✅ POST /properties - Create new property with validation
- ✅ PUT /properties/:id - Update existing property with validation
- ✅ DELETE /properties/:id - Delete property (prevents deletion with active leases)

### Frontend (client/src/pages/Properties.tsx)
- ✅ Properties list with card layout
- ✅ Add Property form with all fields
- ✅ Edit Property form (reuses same form)
- ✅ Delete Property with confirmation
- ✅ Real-time UI updates using React Query
- ✅ Form validation and error handling
- ✅ Loading states and user feedback

### API Service (client/src/services/apiService.ts)
- ✅ getProperties() - Fetch all properties
- ✅ createProperty() - Create new property
- ✅ updateProperty() - Update existing property
- ✅ deleteProperty() - Delete property
- ✅ JWT authentication headers
- ✅ Error handling and token refresh

## Validation Rules

### Required Fields
- address (min 1 character)
- city (min 1 character)
- state (exactly 2 characters)
- zipCode (min 5 characters)
- type (enum: SINGLE_FAMILY, DUPLEX, CONDO, TOWNHOUSE, APARTMENT, OTHER)

### Optional Fields
- bedrooms (non-negative integer)
- bathrooms (non-negative number, allows decimals)
- squareFeet (non-negative integer)
- purchasePrice (non-negative number)
- currentValue (non-negative number)
- mortgage (non-negative number)

## Error Handling

### Backend
- 400: Validation errors with detailed messages
- 401: Authentication required or invalid token
- 404: Property not found or not owned by user
- 500: Internal server errors

### Frontend
- Form validation before submission
- Network error handling
- Loading states during operations
- Success/error notifications via React Query
- Automatic token refresh on 401 errors

## Next Steps

With Properties CRUD complete, the next features to implement according to DEV_PLAN.md are:

1. **Tenants CRUD** - Similar to Properties but for tenant management
2. **Leases CRUD** - Link properties to tenants with lease agreements
3. **Financial Tracking** - Rent payments, expenses, income reports
4. **File Uploads** - Property photos, documents, lease agreements
5. **Maintenance Requests** - Track property maintenance and repairs
