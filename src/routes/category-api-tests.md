# Category CRUD API Testing

## Base URL
```
http://localhost:3000/api/category
```

## Test Data

### Sample Category 1 - Salud
```json
{
  "name": "Salud",
  "description": "Hábitos relacionados con la salud física y mental",
  "color": "#FF6B6B",
  "icon": "heart"
}
```

### Sample Category 2 - Productividad
```json
{
  "name": "Productividad",
  "description": "Hábitos para mejorar la productividad diaria",
  "color": "#4ECDC4",
  "icon": "rocket"
}
```

### Sample Category 3 - Finanzas
```json
{
  "name": "Finanzas",
  "description": "Hábitos para mejorar la gestión financiera personal",
  "color": "#95E1D3",
  "icon": "dollar"
}
```

## Quick Test Commands (curl)

### 1. Create Category (requires admin auth)
```bash
curl -X POST http://localhost:3000/api/category \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_ADMIN_TOKEN" \
  -d '{"name":"Salud","description":"Hábitos relacionados con la salud física y mental","color":"#FF6B6B","icon":"heart"}'
```

### 2. Get All Categories (public)
```bash
curl http://localhost:3000/api/category
```

### 3. Get Category by ID (public)
```bash
curl http://localhost:3000/api/category/CATEGORY_ID
```

### 4. Update Category (requires admin auth)
```bash
curl -X PUT http://localhost:3000/api/category/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_ADMIN_TOKEN" \
  -d '{"color":"#00FF00"}'
```

### 5. Delete Category (requires admin auth)
```bash
curl -X DELETE http://localhost:3000/api/category/CATEGORY_ID \
  -b "access_token=YOUR_ADMIN_TOKEN"
```

## Expected Responses

### Success - Create (201)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Salud",
  "description": "Hábitos relacionados con la salud física y mental",
  "color": "#FF6B6B",
  "icon": "heart",
  "createdAt": "2025-11-22T22:53:00.000Z",
  "updatedAt": "2025-11-22T22:53:00.000Z"
}
```

### Success - Get All (200)
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Salud",
    "description": "Hábitos relacionados con la salud física y mental",
    "color": "#FF6B6B",
    "icon": "heart",
    "createdAt": "2025-11-22T22:53:00.000Z",
    "updatedAt": "2025-11-22T22:53:00.000Z"
  }
]
```

### Error - Duplicate Name (400)
```json
{
  "error": "Ya existe una categoría con ese nombre"
}
```

### Error - Not Found (404)
```json
{
  "error": "Categoría no encontrada"
}
```

### Error - Unauthorized (401)
```json
{
  "error": "No Autorizado"
}
```

### Error - Forbidden (403)
```json
{
  "error": "Acceso Denegado"
}
```

## Validation Errors

### Missing Required Field
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "El nombre es obligatorio",
      "path": "name",
      "location": "body"
    }
  ]
}
```

### Invalid Color Format
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "El color debe ser un código hexadecimal válido (ej: #FF5733)",
      "path": "color",
      "location": "body"
    }
  ]
}
```
