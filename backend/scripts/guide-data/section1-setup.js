module.exports = function getSection1() {
  return `## Section 1: Testing Environment Setup & Postman Configuration

This section provides comprehensive instructions for configuring and executing manual API tests against the Deck Estimator platform using Postman.

### 1.1 Backend Architecture & Base URLs

The application uses an Express.js backend connecting to a live MongoDB Atlas cluster, with optional integration to a Python ML microservice.

- **Backend Host URL:** \`http://localhost:5000\`
- **API Base URL:** \`http://localhost:5000/api/v1\`
- **Frontend URL:** \`http://localhost:5173\` (Vite Dev Server)
- **Database Engine:** MongoDB Atlas (Database: \`DECK_ESTIMATOR\`)
- **Default Port:** \`5000\` (Configurable via \`backend/.env\` variable \`PORT\`)

### 1.2 How to Start the Backend Server

To start the backend application in development mode:

1. Open PowerShell or a terminal window.
2. Navigate to the project root directory (\`e:\\DeckEstimator\`).
3. Execute the start script:
   \`\`\`powershell
   npm start --prefix backend
   \`\`\`
4. Observe the terminal output to confirm that database connection and environment variables load properly:
   \`\`\`text
   > deck-estimator-backend@0.1.0 start
   > node src/server.js

   ◇ injected env (6) from .env
   [Database] MongoDB Atlas connected successfully (DECK_ESTIMATOR)
   [Server] Environment: development
   [Server] Listening on http://localhost:5000/api/v1
   \`\`\`

### 1.3 How to Check Whether the Server Is Running

You can check whether the backend is up and running using any of the following methods:

1. **Browser / Postman Health Check:**
   - URL: \`http://localhost:5000/api/v1/health\`
   - HTTP Method: \`GET\`
   - Status: \`200 OK\`
   - Response Payload:
     \`\`\`json
     {
       "success": true,
       "data": {
         "status": "ok",
         "environment": "development",
         "timestamp": "2026-11-02T14:00:00.000Z"
       }
     }
     \`\`\`
2. **Terminal Curl / Fetch Verification:**
   \`\`\`powershell
   curl http://localhost:5000/api/v1/health
   \`\`\`

### 1.4 How to Open Postman and Create a Collection

1. Launch the **Postman** desktop application (or Postman Web Agent).
2. Click **Collections** in the left sidebar navigation.
3. Click the **+** (New Collection) icon.
4. Name the collection: **\`Deck Estimator - Manual API Test Suite\`**.
5. Add a description: *"Complete phase-by-phase manual API testing suite for Deck Estimator RESTful backend."*

### 1.5 How to Configure Environment Variables

Environment variables allow dynamic sharing of authentication tokens, IDs, and endpoints between requests.

1. Click **Environments** in the left sidebar &rarr; Click **Create Environment**.
2. Name the environment: **\`DeckEstimator Dev\`**.
3. Define the following variables:

| Variable Name | Initial Value | Current Value | Description / Usage |
| :--- | :--- | :--- | :--- |
| \`baseUrl\` | \`http://localhost:5000/api/v1\` | \`http://localhost:5000/api/v1\` | Common API base URL prefix |
| \`customerToken\` | *(empty)* | *(auto-populated)* | JWT Bearer token for Customer role |
| \`contractorToken\` | *(empty)* | *(auto-populated)* | JWT Bearer token for Contractor role |
| \`adminToken\` | *(empty)* | *(auto-populated)* | JWT Bearer token for Administrator role |
| \`deckId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of created Deck project |
| \`estimateId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of created Pricing Estimate |
| \`leadId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of created Inquiry Lead |
| \`contractorId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of Contractor Profile |
| \`policyId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of Commission Policy |
| \`commissionId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of generated Commission |
| \`materialId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of active Material item |
| \`serviceId\` | *(empty)* | *(auto-populated)* | MongoDB \`_id\` of active Service item |
| \`pricingConfigId\`| *(empty)* | *(auto-populated)* | MongoDB \`_id\` of Pricing Configuration |

4. Select **DeckEstimator Dev** from the top-right environment picker dropdown.

### 1.6 How to Configure Authentication Tokens

The backend supports dual authentication mechanisms:

1. **Authorization Header (Standard REST / Postman Recommended):**
   - Header Name: \`Authorization\`
   - Value: \`Bearer {{customerToken}}\` (or \`Bearer {{contractorToken}}\` / \`Bearer {{adminToken}}\`)
2. **HttpOnly Session Cookie (\`token\`):**
   - The backend \`POST /api/v1/auth/login\` endpoint automatically issues a \`Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Path=/\` cookie.
   - Postman automatically stores and transmits cookies for \`localhost\`, but explicit \`Authorization: Bearer <token>\` headers are recommended for clear role switching during testing.

**Postman Automated Token Capture Script:**
In the \`POST /api/v1/auth/login\` request, open the **Tests** tab and paste:

\`\`\`javascript
const res = pm.response.json();
if (res.success && res.data && res.data.token) {
    const userRole = res.data.user.role;
    if (userRole === 'admin') {
        pm.environment.set('adminToken', res.data.token);
        console.log('Admin token saved.');
    } else if (userRole === 'contractor') {
        pm.environment.set('contractorToken', res.data.token);
        console.log('Contractor token saved.');
    } else {
        pm.environment.set('customerToken', res.data.token);
        console.log('Customer token saved.');
    }
}
\`\`\`

### 1.7 How to Set Common Headers

For every standard JSON endpoint in the collection:

\`\`\`http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{customerToken}}
\`\`\`

You can set these on the Collection level (**Authorization** tab &rarr; Type: **Bearer Token** &rarr; Token: \`{{customerToken}}\`), or individually per request.

### 1.8 How to Send JSON Requests

1. Choose the HTTP Method (\`POST\`, \`PATCH\`, \`PUT\`).
2. Enter the URL: \`{{baseUrl}}/decks\`
3. Select the **Body** tab &rarr; Choose the **raw** radio button.
4. Select **JSON** from the format dropdown (located on the right).
5. Paste the valid JSON payload matching the documented Joi validation rules.
6. Click **Send**.

### 1.9 How to Send Multipart/Form-Data Requests for File Uploads

For secure deck photo uploads (\`POST /api/v1/decks/:deckId/images\`) and contractor verification document uploads (\`POST /api/v1/contractors/me/verification/documents\`):

1. Set Method: \`POST\`
2. Set URL: \`{{baseUrl}}/decks/{{deckId}}/images\`
3. In **Headers**, ensure \`Content-Type\` is **NOT** manually set (Postman will auto-generate \`multipart/form-data; boundary=...\`). Ensure \`Authorization: Bearer {{customerToken}}\` is present.
4. Open the **Body** tab &rarr; Select **form-data**.
5. Add row:
   - **KEY:** \`images\` (change dropdown on the right of KEY from *Text* to *File*).
   - **VALUE:** Click *Select Files* and choose 1 to 5 image files (\`.jpg\`, \`.png\`, or \`.webp\`, each under 10MB).
6. Optional metadata rows (Type: *Text*):
   - **KEY:** \`caption\` | **VALUE:** \`Backyard deck split surface\`
7. Click **Send**.

### 1.10 How to Read HTTP Status Codes and Response Envelopes

Every endpoint adheres to a standardized response structure:

#### Success Envelope (HTTP 200 / 201)
\`\`\`json
{
  "success": true,
  "data": {
    "id": "6ae87b6db8fa5774ba5b4615",
    "projectName": "Lakefront Cedar Deck",
    "createdAt": "2026-11-02T12:00:00.000Z"
  },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10
  }
}
\`\`\`

#### Error Envelope (HTTP 400 / 401 / 403 / 404 / 409 / 429 / 500)
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Project name is required",
    "details": [
      {
        "field": "projectName",
        "message": "Project name is required",
        "type": "body"
      }
    ]
  }
}
\`\`\`

**Quick Status Code Reference:**
- **\`200 OK\`**: Successful retrieval, update, or deletion.
- **\`201 Created\`**: New resource persisted to MongoDB Atlas.
- **\`400 Bad Request\`**: Validation constraint failure (e.g., negative dimension, missing required field).
- **\`401 Unauthorized\`**: Missing, invalid, or expired JWT session.
- **\`403 Forbidden\`**: Authenticated user role is not permitted (e.g., customer attempting admin route, or pending contractor accessing locked features).
- **\`404 Not Found\`**: Referenced resource identifier does not exist.
- **\`409 Conflict\`**: Duplicate unique key (e.g. duplicate email, duplicate category code, or invalid state transition).
- **\`429 Too Many Requests\`**: Rate limit reached.
- **\`500 Internal Server Error\`**: Unhandled server exception.

---
`;
};

