# Especificações - App TodoList

## 1. Entidades

### User
- `id`: identificador único
- `name`: nome completo
- `email`: email único (usado para login)
- `password`: senha (hash)
- `created_at`: data de criação
- `updated_at`: data de atualização

### Task
- `id`: identificador único
- `user_id`: referência ao usuário proprietário
- `title`: título da tarefa
- `description`: descrição detalhada (opcional)
- `status`: estado da tarefa (pending, in_progress, completed)
- `priority`: prioridade (low, medium, high)
- `due_date`: data de vencimento (opcional)
- `created_at`: data de criação
- `updated_at`: data de atualização
- `completed_at`: data de conclusão (opcional)

## 2. Features - Checklist

### Autenticação & Autorização
- [ ] Registro de novo usuário
- [ ] Login de usuário existente
- [ ] Geração de token JWT
- [ ] Validação de token JWT em rotas protegidas
- [ ] Refresh token (opcional, mas recomendado)
- [ ] Logout (invalidação de token, se implementar blacklist)
- [ ] Recuperação de senha (opcional)

### Gerenciamento de Usuário
- [ ] Visualizar perfil do usuário
- [ ] Atualizar dados do usuário
- [ ] Alterar senha
- [ ] Deletar conta (opcional)

### Gerenciamento de Tasks
- [ ] Criar nova task
- [ ] Listar todas as tasks do usuário
- [ ] Filtrar tasks por status
- [ ] Filtrar tasks por prioridade
- [ ] Filtrar tasks por data de vencimento
- [ ] Buscar tasks por título/descrição
- [ ] Visualizar detalhes de uma task específica
- [ ] Atualizar task (título, descrição, prioridade, etc)
- [ ] Mudar status da task
- [ ] Marcar task como concluída
- [ ] Deletar task
- [ ] Ordenar tasks (por data, prioridade, status)

### Validações & Regras de Negócio
- [ ] Email único no cadastro
- [ ] Validação de formato de email
- [ ] Senha com requisitos mínimos (tamanho, complexidade)
- [ ] Usuário só pode acessar suas próprias tasks
- [ ] Validação de campos obrigatórios
- [ ] Validação de formatos de data
- [ ] Validação de valores de enum (status, priority)

### Extras (Opcional)
- [ ] Paginação nas listagens
- [ ] Estatísticas do usuário (total de tasks, concluídas, pendentes)
- [ ] Tags/categorias para tasks
- [ ] Subtasks
- [ ] Notificações de tasks vencendo

## 3. Rotas da API

### Autenticação (Públicas)
```
POST   /api/auth/register          - Registrar novo usuário
POST   /api/auth/login             - Login e geração de JWT
POST   /api/auth/refresh           - Renovar token JWT (opcional)
POST   /api/auth/logout            - Logout (opcional)
POST   /api/auth/forgot-password   - Solicitar recuperação de senha (opcional)
POST   /api/auth/reset-password    - Resetar senha (opcional)
```

### Usuário (Protegidas - requer JWT)
```
GET    /api/users/me               - Obter dados do usuário logado
PUT    /api/users/me               - Atualizar dados do usuário
PATCH  /api/users/me/password      - Alterar senha
DELETE /api/users/me               - Deletar conta (opcional)
```

### Tasks (Protegidas - requer JWT)
```
POST   /api/tasks                  - Criar nova task
GET    /api/tasks                  - Listar todas as tasks do usuário
                                     Query params: status, priority, due_date, search, page, limit, sort
GET    /api/tasks/:id              - Obter detalhes de uma task específica
PUT    /api/tasks/:id              - Atualizar task completa
PATCH  /api/tasks/:id              - Atualizar campos específicos da task
PATCH  /api/tasks/:id/status       - Atualizar apenas o status
PATCH  /api/tasks/:id/complete     - Marcar como concluída
DELETE /api/tasks/:id              - Deletar task
```

### Extras (Opcionais)
```
GET    /api/tasks/stats            - Estatísticas das tasks do usuário
GET    /api/tasks/overdue          - Listar tasks vencidas
GET    /api/tasks/today            - Tasks com vencimento hoje
GET    /api/tasks/upcoming         - Tasks próximas do vencimento
```

## 4. Fluxo de Desenvolvimento - Roadmap

### Fase 1: Setup & Autenticação
1. Configurar estrutura do projeto
2. Configurar banco de dados
3. Criar modelo User
4. Implementar registro de usuário
5. Implementar login com JWT
6. Implementar middleware de autenticação
7. Testes das rotas de autenticação

### Fase 2: Gerenciamento de Usuário
1. Implementar rota de perfil
2. Implementar atualização de dados
3. Implementar alteração de senha
4. Validações de dados do usuário
5. Testes das rotas de usuário

### Fase 3: CRUD de Tasks
1. Criar modelo Task
2. Implementar criação de task
3. Implementar listagem de tasks
4. Implementar visualização de task
5. Implementar atualização de task
6. Implementar deleção de task
7. Testes do CRUD básico

### Fase 4: Funcionalidades Avançadas de Tasks
1. Implementar filtros (status, prioridade, data)
2. Implementar busca por texto
3. Implementar paginação
4. Implementar ordenação
5. Implementar mudança de status/conclusão
6. Testes das funcionalidades avançadas

### Fase 5: Validações & Segurança
1. Validação de ownership (usuário x tasks)
2. Validações de entrada em todas as rotas
3. Tratamento de erros padronizado
4. Rate limiting (opcional)
5. Testes de segurança

### Fase 6: Extras & Otimizações
1. Implementar estatísticas
2. Implementar rotas de conveniência (overdue, today, etc)
3. Otimizações de queries
4. Documentação da API
5. Testes finais e2e

## 5. Códigos de Resposta HTTP

- `200 OK`: Sucesso em GET, PUT, PATCH
- `201 Created`: Sucesso em POST (criação)
- `204 No Content`: Sucesso em DELETE
- `400 Bad Request`: Erro de validação
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Não autorizado (sem permissão)
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: email já existe)
- `422 Unprocessable Entity`: Erro de validação semântica
- `500 Internal Server Error`: Erro do servidor