# 📝 TodoApp API Documentation

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Configuração](#configuração)
- [Autenticação](#autenticação)
- [Modelos de Dados](#modelos-de-dados)
- [Endpoints](#endpoints)
  - [Autenticação](#endpoints-de-autenticação)
  - [Usuários](#endpoints-de-usuários)
  - [Tarefas](#endpoints-de-tarefas)
- [Códigos de Status](#códigos-de-status)
- [Tratamento de Erros](#tratamento-de-erros)

---

## 🎯 Visão Geral

API REST para gerenciamento de tarefas (To-Do List) construída com Fastify, TypeScript e Prisma. A API oferece recursos completos de autenticação, gerenciamento de usuários e CRUD de tarefas.

**Base URL:** `http://localhost:3000`

---

## 🛠 Tecnologias

- **Runtime:** Node.js
- **Framework:** Fastify
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** SQLite
- **Validação:** Zod
- **Autenticação:** JWT (JSON Web Tokens)
- **Criptografia:** bcrypt
- **Gerenciador de Pacotes:** pnpm

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
JWT_SECRET=seu_jwt_secret
JWT_REFRESH_SECRET=seu_jwt_refresh_secret
COOKIE_SECRET=seu_cookie_secret
NODE_ENV=development
```

### Servidor

- **Porta:** 3000
- **Host:** 0.0.0.0

---

## 🔐 Autenticação

A API utiliza autenticação baseada em JWT com dois tipos de tokens:

### Access Token
- **Validade:** 8 horas
- **Armazenamento:** Cookie HttpOnly
- **Path:** `/`
- **Uso:** Todas as requisições autenticadas

### Refresh Token
- **Validade:** 7 dias
- **Armazenamento:** Cookie HttpOnly
- **Path:** `/api/auth/refresh`
- **Uso:** Renovação de tokens

### Headers de Autenticação

As rotas protegidas requerem cookies automaticamente enviados pelo navegador. Para requisições via API clients, os cookies devem ser incluídos.

---

## 📊 Modelos de Dados

### User

```typescript
{
  id: string (UUID)
  fullName: string
  email: string (unique)
  age: number
  password: string (hashed)
  createdAt: DateTime
  updatedAt: DateTime
  tasks: Task[]
  otps: PasswordResetToken[]
}
```

### Task

```typescript
{
  id: number (autoincrement)
  userId: string
  title: string
  description: string | null
  status: TaskStatus (PENDING | IN_PROGRESS | DONE | CANCELED)
  priority: TaskPriority (LOW | MEDIUM | HIGH)
  dueDate: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
  completedAt: DateTime | null
}
```

### PasswordResetToken

```typescript
{
  id: string (UUID)
  userId: string
  token: number (6 dígitos)
  expires_At: DateTime
  used: boolean
}
```

---

## 📡 Endpoints

### Endpoints de Autenticação

#### 1. Registrar Novo Usuário

**POST** `/api/auth/register`

Cria uma nova conta de usuário.

**Request Body:**
```json
{
  "fullName": "João Silva",
  "age": 25,
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Validações:**
- `fullName`: mínimo 3 caracteres
- `age`: número inteiro, mínimo 0
- `email`: formato de email válido
- `password`: mínimo 6 caracteres

**Response (201 - Created):**
```json
{
  "user": {
    "id": "uuid-string",
    "fullName": "João Silva",
    "email": "joao@example.com",
    "age": 25,
    "createdAt": "2026-02-06T10:00:00.000Z",
    "updatedAt": "2026-02-06T10:00:00.000Z"
  }
}
```

**Cookies Definidos:**
- `accessToken`: Token JWT (válido por 8h)
- `refreshToken`: Token JWT (válido por 7d)

**Erros:**
- `409 Conflict`: Email já está em uso

---

#### 2. Login

**POST** `/api/auth/login`

Autentica um usuário existente.

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Validações:**
- `email`: formato de email válido
- `password`: mínimo 6 caracteres

**Response (200 - OK):**
```json
{
  "user": {
    "id": "uuid-string",
    "fullName": "João Silva",
    "email": "joao@example.com",
    "age": 25,
    "createdAt": "2026-02-06T10:00:00.000Z",
    "updatedAt": "2026-02-06T10:00:00.000Z"
  }
}
```

**Cookies Definidos:**
- `accessToken`: Token JWT (válido por 8h)
- `refreshToken`: Token JWT (válido por 7d)

**Erros:**
- `401 Unauthorized`: Email ou senha inválidos

---

### Endpoints de Usuários

#### 3. Obter Perfil do Usuário Atual

**GET** `/api/users/me`

🔒 **Autenticação necessária**

Retorna os dados do usuário autenticado.

**Response (200 - OK):**
```json
{
  "id": "uuid-string",
  "fullName": "João Silva",
  "email": "joao@example.com",
  "age": 25,
  "createdAt": "2026-02-06T10:00:00.000Z",
  "updatedAt": "2026-02-06T10:00:00.000Z"
}
```

**Erros:**
- `404 Not Found`: Usuário não encontrado

---

#### 4. Atualizar Perfil

**PUT** `/api/users/me`

🔒 **Autenticação necessária**

Atualiza os dados do perfil do usuário.

**Request Body (todos os campos opcionais):**
```json
{
  "fullName": "João Pedro Silva",
  "age": 26,
  "email": "joaopedro@example.com"
}
```

**Validações:**
- `fullName`: mínimo 3 caracteres (se fornecido)
- `age`: número inteiro, mínimo 0 (se fornecido)
- `email`: formato de email válido (se fornecido)

**Response (200 - OK):**
```json
{
  "id": "uuid-string",
  "fullName": "João Pedro Silva",
  "email": "joaopedro@example.com",
  "age": 26,
  "createdAt": "2026-02-06T10:00:00.000Z",
  "updatedAt": "2026-02-06T11:00:00.000Z"
}
```

**Erros:**
- `404 Not Found`: Usuário não encontrado

---

#### 5. Atualizar Senha

**PATCH** `/api/users/me/password`

🔒 **Autenticação necessária**

Atualiza a senha do usuário.

**Request Body:**
```json
{
  "currentPassword": "senhaAntiga123",
  "newPassword": "senhaNova456"
}
```

**Validações:**
- `currentPassword`: mínimo 6 caracteres
- `newPassword`: mínimo 6 caracteres

**Response (200 - OK):**
```json
{
  "id": "uuid-string",
  "fullName": "João Silva",
  "email": "joao@example.com",
  "age": 25,
  "createdAt": "2026-02-06T10:00:00.000Z",
  "updatedAt": "2026-02-06T12:00:00.000Z"
}
```

**Erros:**
- `400 Bad Request`: Senha atual incorreta
- `404 Not Found`: Usuário não encontrado

---

### Endpoints de Tarefas

#### 6. Criar Nova Tarefa

**POST** `/api/tasks`

🔒 **Autenticação necessária**

Cria uma nova tarefa para o usuário autenticado.

**Request Body:**
```json
{
  "title": "Implementar funcionalidade X",
  "description": "Descrição detalhada da tarefa",
  "priority": "HIGH",
  "dueDate": "2026-02-15T18:00:00.000Z"
}
```

**Validações:**
- `title`: 1-120 caracteres
- `description`: máximo 2000 caracteres
- `priority`: `LOW`, `MEDIUM` ou `HIGH`
- `dueDate`: data válida ou null

**Response (201 - Created):**
```json
{
  "id": 1,
  "userId": "uuid-string",
  "title": "Implementar funcionalidade X",
  "description": "Descrição detalhada da tarefa",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2026-02-15T18:00:00.000Z",
  "createdAt": "2026-02-06T10:00:00.000Z",
  "updatedAt": "2026-02-06T10:00:00.000Z",
  "completedAt": null
}
```

**Erros:**
- `500 Internal Server Error`: Falha ao criar tarefa

---

#### 7. Listar Tarefas

**GET** `/api/tasks`

🔒 **Autenticação necessária**

Lista todas as tarefas do usuário autenticado com filtros opcionais.

**Query Parameters (todos opcionais):**
- `status`: `PENDING`, `IN_PROGRESS` ou `DONE`
- `priority`: `LOW`, `MEDIUM` ou `HIGH`
- `due_date`: data no formato ISO 8601
- `sort`: `dueDate` ou `createdAt` (padrão: `createdAt`)

**Exemplo de Request:**
```
GET /api/tasks?status=PENDING&priority=HIGH&sort=dueDate
```

**Response (200 - OK):**
```json
[
  {
    "id": 1,
    "userId": "uuid-string",
    "title": "Implementar funcionalidade X",
    "description": "Descrição detalhada da tarefa",
    "status": "PENDING",
    "priority": "HIGH",
    "dueDate": "2026-02-15T18:00:00.000Z",
    "createdAt": "2026-02-06T10:00:00.000Z",
    "updatedAt": "2026-02-06T10:00:00.000Z",
    "completedAt": null
  },
  {
    "id": 2,
    "userId": "uuid-string",
    "title": "Revisar código",
    "description": "Code review do PR #123",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "dueDate": "2026-02-10T18:00:00.000Z",
    "createdAt": "2026-02-05T10:00:00.000Z",
    "updatedAt": "2026-02-06T09:00:00.000Z",
    "completedAt": null
  }
]
```

**Erros:**
- `500 Internal Server Error`: Tarefas não encontradas

---

#### 8. Obter Tarefa por ID

**GET** `/api/tasks/:id`

🔒 **Autenticação necessária**

Retorna os detalhes de uma tarefa específica.

**Path Parameters:**
- `id`: ID numérico da tarefa

**Exemplo de Request:**
```
GET /api/tasks/1
```

**Response (200 - OK):**
```json
{
  "id": 1,
  "userId": "uuid-string",
  "title": "Implementar funcionalidade X",
  "description": "Descrição detalhada da tarefa",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2026-02-15T18:00:00.000Z",
  "createdAt": "2026-02-06T10:00:00.000Z",
  "updatedAt": "2026-02-06T10:00:00.000Z",
  "completedAt": null
}
```

**Erros:**
- `404 Not Found`: Tarefa não encontrada

---

## 📋 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso - Requisição processada com sucesso |
| 201 | Criado - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos ou faltando |
| 401 | Não Autorizado - Falha na autenticação |
| 404 | Não Encontrado - Recurso não existe |
| 409 | Conflito - Recurso já existe |
| 500 | Erro do Servidor - Erro interno |

---

## ⚠️ Tratamento de Erros

### Formato de Erro Padrão

```json
{
  "error": "Mensagem descritiva do erro"
}
```

### Exemplos de Erros Comuns

**Validação com Zod:**
```json
{
  "error": "Validation error",
  "issues": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

**Autenticação:**
```json
{
  "error": "Invalid email or password"
}
```

**Recurso não encontrado:**
```json
{
  "error": "User not found"
}
```

**Conflito:**
```json
{
  "error": "Email already in use"
}
```

---

## 🔒 Segurança

### Boas Práticas Implementadas

1. **Senhas:** Hash com bcrypt (10 rounds)
2. **JWT:** Tokens assinados com secrets fortes
3. **Cookies:** 
   - HttpOnly: protege contra XSS
   - SameSite: protege contra CSRF
   - Secure: HTTPS em produção
4. **Validação:** Zod valida todos os inputs
5. **Dados Sensíveis:** Senha nunca retornada nas responses

---

## 📝 Notas Adicionais

- A senha do usuário nunca é retornada nas responses
- Tokens JWT incluem apenas o `user_id` no payload
- O campo `password` dos usuários é sempre hash com bcrypt

---

## 🚀 Começando

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm prisma generate
pnpm prisma migrate dev

# Iniciar servidor
pnpm start
```

---
