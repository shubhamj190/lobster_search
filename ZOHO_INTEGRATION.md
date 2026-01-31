# How to Create a Backend API for Zoho CRM

This guide details the steps to create a backend integration that securely pushes data (e.g., from your signup form) into Zoho CRM using the REST API.

## Prerequisites
- A **Zoho CRM** account (any edition with API access).
- A backend server (Node.js, Python, PHP, etc.) or a Cloud Function (AWS Lambda, Vercel, etc.).
- Basic knowledge of REST APIs.

---

## Step 1: Register Your Application (OAuth 2.0)
To access Zoho CRM programmatically, you first need to register your app to get credentials.

1.  Log in to the **[Zoho API Console](https://api-console.zoho.com/)**.
2.  Click **Add Client**.
3.  Choose **Server-based Applications**.
4.  Fill in the details:
    *   **Client Name**: e.g., "LobsterSearchWebsite"
    *   **Homepage URL**: e.g., `https://yourwebsite.com`
    *   **Authorized Redirect URIs**: e.g., `http://localhost:3000/callback` (for setup) or your production callback URL.
5.  Click **Create**.
6.  **Copy & Save**: Note down your `Client ID` and `Client Secret`. **Never expose these in your frontend code (HTML/JS).**

## Step 2: Generate Authentication Tokens
You need a "Refresh Token" to allow your backend to get new access tokens indefinitely without manual login.

### 2a. Get the Grant Token (One-time)
Paste this URL in your browser (replace `YOUR_CLIENT_ID` and `YOUR_REDIRECT_URI`):

```
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.READ&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_REDIRECT_URI
```

1.  Hit Enter.
2.  Click **Accept** on the Zoho consent screen.
3.  You will be redirected to your redirect URI.
4.  Copy the `code` parameter from the URL address bar. This is your **Grant Token** (valid for only 1 minute!).

### 2b. Generate Refresh & Access Tokens
Using a tool like **Postman** or **cURL**, make a POST request immediately:

**Endpoint**: `https://accounts.zoho.com/oauth/v2/token`

**Parameters (Body or Query):**
*   `grant_type`: `authorization_code`
*   `client_id`: `YOUR_CLIENT_ID`
*   `client_secret`: `YOUR_CLIENT_SECRET`
*   `redirect_uri`: `YOUR_REDIRECT_URI`
*   `code`: `YOUR_GRANT_CODE` (from step 2a)

**Response:**
Save the `refresh_token` securely. You will use this in your backend code.

---

## Step 3: Backend Implementation
Since you cannot safely call the Zoho API directly from `script.js` (it would expose your secrets), you need a simple backend.

### Example: Node.js (Express) Endpoint

1.  **Install Dependencies**: `npm install axios express body-parser`
2.  **Create Server File (`server.js`)**:

```javascript
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ZOHO_CONFIG = {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    refreshToken: 'YOUR_REFRESH_TOKEN',
    redirectUri: 'YOUR_REDIRECT_URI'
};

// Function to get a fresh Access Token
async function getAccessToken() {
    const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${ZOHO_CONFIG.refreshToken}&client_id=${ZOHO_CONFIG.clientId}&client_secret=${ZOHO_CONFIG.clientSecret}&grant_type=refresh_token`;
    const response = await axios.post(url);
    return response.data.access_token;
}

// Your API Endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        
        // Map frontend data to Zoho CRM Field API Names
        const leadData = {
            data: [
                {
                    "First_Name": req.body.First_Name,
                    "Last_Name": req.body.Last_Name,
                    "Phone": req.body.Phone,
                    "City": req.body.City,
                    // Use standard or custom field API names
                    "Description": `Gender: ${req.body.Gender}`, 
                    "Lead_Source": "Website Signup"
                }
            ]
        };

        const zohoRes = await axios.post(
            'https://www.zohoapis.com/crm/v2/Leads', 
            leadData, 
            {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ success: true, id: zohoRes.data.data[0].details.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Step 4: Connect Frontend
Update your `script.js` to call your new backend endpoint instead of the mock URL.

```javascript
const API_ENDPOINT = 'https://your-backend-domain.com/api/signup'; // Your new backend

fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
// ... handle response
```

## Important Notes
*   **API Limits**: Zoho CRM has daily API limits based on your edition.
*   **Field Names**: Ensure the keys in your JSON (e.g., `First_Name`, `Last_Name`) match exactly with the **API Name** of the fields in Zoho CRM (Setup > Developer Space > APIs > API Names).
*   **Data Center**: If your account is in EU/AU/IN, use the corresponding domain (e.g., `accounts.zoho.eu`, `www.zohoapis.eu`).
