# SRMAP Mess Pass Portal - API Documentation

Complete API reference for the SRMAP International Mess Pass Portal.

## Base URL

**Development:** `http://localhost:3000/api`

**Production (Vercel):** `https://your-app.vercel.app/api`

## Authentication

All endpoints (except login) require JWT authentication.

### Header Format
```
Authorization: Bearer <token>
```

### How to Get Token

1. Call login endpoint
2. Store token in localStorage
3. Include in Authorization header for subsequent requests

---

## 🔐 Authentication Endpoints

### 1. Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate admin user and get JWT token

**Request Body:**
```json
{
  "email": "er.thakuramankumar@gmail.com",
  "password": "Aman228"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "er.thakuramankumar@gmail.com"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"er.thakuramankumar@gmail.com","password":"Aman228"}'
```

---

### 2. Verify Token
**Endpoint:** `GET /auth/verify`

**Description:** Verify if JWT token is valid

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "email": "er.thakuramankumar@gmail.com"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid token"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer <token>"
```

---

## 📋 Pass Endpoints

### 3. Create Pass
**Endpoint:** `POST /passes`

**Description:** Create a new student pass

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "regNumber": "AP20CTH001",
  "photoUrl": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg"
}
```

**Response (201 Created):**
```json
{
  "pass": {
    "_id": "507f1f77bcf86cd799439011",
    "issueId": "SRMAPIM01",
    "fullName": "John Doe",
    "regNumber": "AP20CTH001",
    "photoUrl": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg",
    "issuedDate": "2024-03-05T10:30:00.000Z",
    "createdAt": "2024-03-05T10:30:00.000Z",
    "updatedAt": "2024-03-05T10:30:00.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Student already has a pass"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/passes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "regNumber": "AP20CTH001",
    "photoUrl": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg"
  }'
```

---

### 4. Get All Passes
**Endpoint:** `GET /passes`

**Description:** Retrieve all issued passes

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "passes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "issueId": "SRMAPIM01",
      "fullName": "John Doe",
      "regNumber": "AP20CTH001",
      "photoUrl": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg",
      "issuedDate": "2024-03-05T10:30:00.000Z",
      "createdAt": "2024-03-05T10:30:00.000Z",
      "updatedAt": "2024-03-05T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "issueId": "SRMAPIM02",
      "fullName": "Jane Smith",
      "regNumber": "AP20CTH002",
      "photoUrl": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg",
      "issuedDate": "2024-03-05T11:00:00.000Z",
      "createdAt": "2024-03-05T11:00:00.000Z",
      "updatedAt": "2024-03-05T11:00:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/passes \
  -H "Authorization: Bearer <token>"
```

---

### 5. Get Specific Pass
**Endpoint:** `GET /passes/[id]`

**Description:** Get details of a specific pass by ID

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - MongoDB ObjectId of the pass

**Response (200 OK):**
```json
{
  "pass": {
    "_id": "507f1f77bcf86cd799439011",
    "issueId": "SRMAPIM01",
    "fullName": "John Doe",
    "regNumber": "AP20CTH001",
    "photoUrl": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg",
    "issuedDate": "2024-03-05T10:30:00.000Z",
    "createdAt": "2024-03-05T10:30:00.000Z",
    "updatedAt": "2024-03-05T10:30:00.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "error": "Pass not found"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/passes/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

---

### 6. Search Passes
**Endpoint:** `GET /passes/search?q=query`

**Description:** Search passes by name, registration number, or issue ID

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` - Search query (name, registration number, or issue ID)

**Response (200 OK):**
```json
{
  "passes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "issueId": "SRMAPIM01",
      "fullName": "John Doe",
      "regNumber": "AP20CTH001",
      "photoUrl": "https://res.cloudinary.com/xxx/image/upload/xxx.jpg",
      "issuedDate": "2024-03-05T10:30:00.000Z",
      "createdAt": "2024-03-05T10:30:00.000Z",
      "updatedAt": "2024-03-05T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/passes/search?q=John" \
  -H "Authorization: Bearer <token>"
```

---

### 7. Delete Pass
**Endpoint:** `DELETE /passes/[id]`

**Description:** Delete a specific pass

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - MongoDB ObjectId of the pass

**Response (200 OK):**
```json
{
  "message": "Pass deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "error": "Pass not found"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/passes/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

---

## 📊 Statistics Endpoints

### 8. Get Dashboard Statistics
**Endpoint:** `GET /statistics`

**Description:** Get dashboard statistics (total passes, today's passes, total students)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "totalPasses": 25,
  "todaysPasses": 5,
  "totalStudents": 25
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/statistics \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 Cloudinary Image Upload

Image upload to Cloudinary is done client-side using an unsigned upload preset.

### Configuration Required

1. Create unsigned upload preset in Cloudinary:
   - Preset name: `srmap_mess_pass`
   - Type: Unsigned

2. Environment variables:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

### JavaScript Example

```javascript
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'srmap_mess_pass');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  return data.secure_url; // Use this as photoUrl
}
```

---

## 📝 Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body, some required fields missing |
| 401 | Unauthorized | Check JWT token, may have expired |
| 404 | Not Found | Resource ID is invalid |
| 500 | Internal Server Error | Server error, check logs |

---

## 🧪 Testing with Postman

### 1. Create Postman Collection

```json
{
  "info": {
    "name": "SRMAP Mess Pass API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"er.thakuramankumar@gmail.com\",\"password\":\"Aman228\"}"
        }
      }
    },
    {
      "name": "Get All Passes",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/passes",
        "header": {
          "Authorization": "Bearer {{token}}"
        }
      }
    }
  ]
}
```

### 2. Set Variables

In Postman:
- `base_url`: http://localhost:3000/api
- `token`: (Get from login response)

---

## 📚 Integration Examples

### Node.js / Express
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const passes = await client.get('/passes');
```

### Python / Requests
```python
import requests

headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:3000/api/passes', headers=headers)
passes = response.json()
```

### Flutter / Dio
```dart
final dio = Dio();
dio.options.headers['Authorization'] = 'Bearer $token';
final response = await dio.get('http://localhost:3000/api/passes');
```

---

## 🔒 Security Notes

1. **Never expose tokens** in client-side code
2. **Always use HTTPS** in production
3. **Validate input** on both client and server
4. **Set token expiration** to reasonable time (default: 24h)
5. **Rotate secrets** regularly
6. **Use environment variables** for all secrets

---

## 📊 Rate Limiting (Future)

Consider implementing rate limiting for production:

```javascript
npm install express-rate-limit
```

---

## 📞 Support

For API issues:
1. Check error response message
2. Verify JWT token is valid
3. Check MongoDB connection
4. Review server logs
5. Check browser console for errors

---

**Last Updated:** March 5, 2024
