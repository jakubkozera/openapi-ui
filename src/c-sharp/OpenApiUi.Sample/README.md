# Articles API Sample

This is a demonstration API for managing articles with JWT authentication, built with ASP.NET Core and OpenAPI documentation.

## Features

- **In-memory data storage** - All data is stored in memory for demonstration purposes
- **JWT Authentication** - Bearer token authentication for protected endpoints
- **OpenAPI Documentation** - Interactive API documentation with Swagger UI
- **CRUD Operations** - Full Create, Read, Update, Delete operations for articles
- **Pagination** - Support for paginated article listing with search and filtering
- **Authorization** - Users can only modify their own articles

## API Endpoints

### Public Endpoints

- `GET /api/articles` - Get paginated list of published articles with optional filtering
- `GET /api/articles/{id}` - Get specific article by ID
- `GET /api/articles/tags` - Get all unique tags from published articles
- `POST /api/auth/login` - Login and get JWT token

### Protected Endpoints (Require Authentication)

- `POST /api/articles` - Create new article
- `PUT /api/articles/{id}` - Update own article
- `DELETE /api/articles/{id}` - Delete own article
- `GET /api/articles/my` - Get all articles by current user
- `GET /api/auth/me` - Get current user information

## Sample Users

The following test users are available:

| Login      | Password    | Display Name  |
| ---------- | ----------- | ------------- |
| admin      | admin123    | Administrator |
| john.doe   | password123 | John Doe      |
| jane.smith | secret456   | Jane Smith    |

## Getting Started

1. **Start the application**:

   ```bash
   dotnet run
   ```

2. **Open the API documentation**:
   Navigate to `http://localhost:5120` in your browser

3. **Login to get a token**:

   ```bash
   POST /api/auth/login
   {
     "login": "admin",
     "password": "admin123"
   }
   ```

4. **Use the token for authenticated requests**:
   Add the header: `Authorization: Bearer {your_token}`

## Sample API Usage

### 1. Login

```bash
curl -X POST http://localhost:5120/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "password": "admin123"
  }'
```

### 2. Get Articles (Public)

```bash
curl http://localhost:5120/api/articles?page=1&pageSize=5&search=aspnet
```

### 3. Create Article (Authenticated)

```bash
curl -X POST http://localhost:5120/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "title": "My New Article",
    "content": "This is the content of my new article...",
    "summary": "A brief summary",
    "tags": ["tutorial", "api"],
    "isPublished": true
  }'
```

### 4. Get Specific Article

```bash
curl http://localhost:5120/api/articles/1
```

### 5. Update Article (Authenticated, Own Articles Only)

```bash
curl -X PUT http://localhost:5120/api/articles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "title": "Updated Article Title",
    "content": "Updated content...",
    "summary": "Updated summary",
    "tags": ["updated", "api"],
    "isPublished": true
  }'
```

### 6. Delete Article (Authenticated, Own Articles Only)

```bash
curl -X DELETE http://localhost:5120/api/articles/1 \
  -H "Authorization: Bearer {your_token}"
```

## Features Demonstrated

### Different HTTP Verbs

- **GET** - Retrieving data (articles, user info, tags)
- **POST** - Creating new resources (login, articles)
- **PUT** - Updating existing resources (articles)
- **DELETE** - Removing resources (articles)

### Query Parameters

- `page` - Page number for pagination
- `pageSize` - Number of items per page
- `search` - Search term for filtering articles
- `tag` - Filter by specific tag
- `authorLogin` - Filter by author

### Request Body Types

- **Login Request** - Simple credentials
- **Article Creation** - Complex object with validation
- **Article Update** - Full article data replacement

### Authentication & Authorization

- **Bearer Token Authentication** - JWT tokens for API access
- **User Claims** - Login stored in JWT claims
- **Ownership-based Authorization** - Users can only modify their own articles

### Data Models

- **User** - User account information
- **Article** - Article content with metadata
- **Pagination** - Structured pagination responses
- **Error Responses** - Consistent error handling with ProblemDetails

## OpenAPI Specification

The API generates a comprehensive OpenAPI 3.0 specification that includes:

- Detailed endpoint documentation
- Request/response schemas with validation
- Authentication scheme definitions
- Example responses and error codes
- Interactive testing interface

Access the interactive documentation at: `http://localhost:5120`

## Technology Stack

- **ASP.NET Core** - Web framework
- **JWT Authentication** - Security tokens
- **OpenAPI/Swagger** - API documentation
- **System.ComponentModel.DataAnnotations** - Model validation
- **In-Memory Collections** - Data storage

This sample demonstrates modern API development practices with comprehensive documentation and security features.
