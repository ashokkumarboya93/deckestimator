module.exports = function getSection5FilesAI() {
  return `## Section 5: File Uploads & AI Condition Analysis Testing Guide

This section provides granular instructions for testing multipart file uploads and AI condition analysis telemetry.

---

### 5.1 File Upload Constraints & Security Rules

| Constraint | Rule | Rejection Behavior |
| :--- | :--- | :--- |
| **Field Name** | \`images\` (for deck photos) or \`document\` (for contractors) | 400 Bad Request if field name is incorrect |
| **Max File Size** | 10 MB (10,485,760 bytes) per file | Multer throws \`LIMIT_FILE_SIZE\` &rarr; 400 Bad Request |
| **Max Batch Count** | 5 images per request / 10 images total per deck | Multer throws \`LIMIT_FILE_COUNT\` &rarr; 400 Bad Request |
| **Allowed MIME Types**| \`image/jpeg\`, \`image/png\`, \`image/webp\` | 400 Bad Request (\`INVALID_FILE_TYPE\`) |
| **Storage Location** | \`backend/uploads/decks/\` or memory buffers | Files are NOT stored in public static directories |
| **Access Control** | Streamed strictly via authenticated endpoint | Direct static URL access returns 404 |

---

### 5.2 Step-by-Step File Upload Testing in Postman

#### Positive Test: Upload Valid JPEG Photo
1. Method: \`POST\`
2. URL: \`{{baseUrl}}/decks/{{deckId}}/images\`
3. Headers: \`Authorization: Bearer {{customerToken}}\`
4. Body &rarr; **form-data**:
   - Key: \`images\` (File) &rarr; Select a 2MB \`.jpg\` file.
   - Key: \`caption\` (Text) &rarr; \`Weathered southern exposure planks\`
5. Send request &rarr; Expect HTTP **\`201 Created\`**.
6. Response contains \`images[0].id\`. Store this as \`{{imageId}}\`.

#### Negative Test 1: Upload Unsupported File Type
1. Body &rarr; Select a \`.txt\`, \`.pdf\`, or \`.exe\` file for \`images\`.
2. Send request &rarr; Expect HTTP **\`400 Bad Request\`**.
3. Error Code: \`INVALID_FILE_TYPE\`.

#### Negative Test 2: Upload File Exceeding 10MB
1. Body &rarr; Select an image larger than 10MB.
2. Send request &rarr; Expect HTTP **\`400 Bad Request\`**.
3. Error Code: \`LIMIT_FILE_SIZE\`.

#### Negative Test 3: Exceeding Maximum Images Per Deck
1. Upload images repeatedly until total count exceeds 10.
2. Expect HTTP **\`400 Bad Request\`** with message *"Cannot exceed 10 images per deck project."*

#### Private Streaming Verification:
1. Method: \`GET\`
2. URL: \`{{baseUrl}}/decks/{{deckId}}/images/{{imageId}}\`
3. Headers: \`Authorization: Bearer {{customerToken}}\`
4. Send request &rarr; Postman renders image preview in response pane.
5. In **Headers** of response:
   - \`Content-Type: image/jpeg\`
   - \`Cache-Control: private, no-transform\`

---

### 5.3 AI Condition Analysis & ML Service Testing

The Deck Condition Analysis engine evaluates visual surface wear, peeling stain/paint, graying wood fibers, and structural integrity.

#### ML Microservice Integration Overview
- **Python ML Service URL:** \`http://localhost:5001\`
- **Endpoint:** \`http://localhost:5001/predict\`
- **Backend Architecture:** If the Python ML microservice is online, the backend dispatches deck images to it. If offline, the backend gracefully falls back to a deterministic heuristic vision evaluator, ensuring business continuity.

> [!NOTE]
> AI condition analysis results represent experimental machine learning assistance and should never replace on-site physical inspection by a licensed contractor.

#### Step 1: Probe ML Service Health
- **Request:** \`GET {{baseUrl}}/condition-analyses/ml-health\`
- **Expected Result:** HTTP **\`200 OK\`** indicating whether the Python service is active.

#### Step 2: Trigger AI Deck Analysis
- **Request:** \`POST {{baseUrl}}/condition-analyses/decks/{{deckId}}/analyses\`
- **Header:** \`Authorization: Bearer {{customerToken}}\`
- **Expected Result:** HTTP **\`201 Created\`**
- **Response Fields:**
  - \`overallCondition\`: \`excellent\`, \`good\`, \`fair\`, \`poor\`, or \`critical\`.
  - \`confidenceScore\`: Float between 0.00 and 1.00.
  - \`findings\`: Array of detected defect classes (e.g., \`peeling_coating\`, \`surface_cracks\`, \`mold_mildew\`).
  - \`recommendedServices\`: Array of recommended catalog service names matching detected conditions.

#### Step 3: Admin Review & Override
- **Request:** \`PATCH {{baseUrl}}/condition-analyses/{{analysisId}}/review\`
- **Header:** \`Authorization: Bearer {{adminToken}}\`
- **Body:**
  \`\`\`json
  {
    "reviewedStatus": "approved",
    "overrideNotes": "Adjusted confidence to 0.95 after reviewing high-resolution photo."
  }
  \`\`\`
- **Expected Result:** HTTP **\`200 OK\`**.

---
`;
};

