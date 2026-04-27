# Sistema de Roles e Permissões - Doce Encanto

## Hierarquia de Roles

### 1. ADMIN (Administrador)
**Descrição:** Acesso total ao sistema, incluindo configurações críticas e relatórios financeiros.

**Responsabilidades:**
- Gerenciar todos os usuários e suas permissões
- Acessar relatórios financeiros completos
- Configurar sistema e parâmetros globais
- Aprovar ou rejeitar qualquer operação
- Visualizar e exportar todos os dados

**Permissões:**
- `*:*` (acesso total)
- `reports:financial` (relatórios financeiros)
- `users:manage-all` (gerenciar todos os usuários)
- `system:configure` (configurar sistema)

---

### 2. MANAGER (Gerente)
**Descrição:** Gerencia operações do dia a dia, produtos, estoque e pedidos.

**Responsabilidades:**
- Gerenciar produtos e categorias
- Controlar estoque
- Processar pedidos
- Aprovar reembolsos (após análise do suporte)
- Liberar pagamentos de reembolsos
- Visualizar relatórios operacionais

**Permissões:**
- `products:*` (gerenciar produtos)
- `categories:*` (gerenciar categorias)
- `orders:manage` (gerenciar pedidos)
- `inventory:manage` (gerenciar estoque)
- `refunds:approve` (aprovar reembolsos)
- `refunds:process` (processar reembolsos)
- `reports:operational` (relatórios operacionais)

---

### 3. FINANCIAL (Financeiro)
**Descrição:** Responsável por aprovar e processar reembolsos e liberar pagamentos.

**Responsabilidades:**
- Revisar solicitações de reembolso
- Aprovar valores de reembolso
- Processar pagamentos de reembolso
- Acessar relatórios financeiros
- Gerenciar transações da carteira

**Permissões:**
- `refunds:review` (revisar reembolsos)
- `refunds:approve` (aprovar reembolsos)
- `refunds:process` (processar pagamentos)
- `wallet:admin` (gerenciar carteiras)
- `reports:financial` (relatórios financeiros)
- `transactions:view-all` (ver todas as transações)

---

### 4. SUPPORT (Suporte)
**Descrição:** Atende clientes, responde tickets e analisa solicitações de reembolso.

**Responsabilidades:**
- Responder tickets de suporte
- Analisar problemas dos clientes
- Revisar solicitações de reembolso (primeira análise)
- Encaminhar casos complexos para gerência
- Atualizar status de tickets

**Permissões:**
- `tickets:read` (ler tickets)
- `tickets:respond` (responder tickets)
- `tickets:update` (atualizar tickets)
- `refunds:review` (revisar reembolsos - primeira análise)
- `orders:view` (visualizar pedidos)
- `users:view` (visualizar usuários)

---

### 5. CUSTOMER (Cliente)
**Descrição:** Usuário final que faz compras na plataforma.

**Responsabilidades:**
- Fazer compras
- Gerenciar próprio perfil
- Criar tickets de suporte
- Solicitar reembolsos
- Avaliar produtos
- Gerenciar endereços e métodos de pagamento

**Permissões:**
- `profile:manage` (gerenciar próprio perfil)
- `orders:own` (ver próprios pedidos)
- `tickets:create` (criar tickets)
- `tickets:own` (ver próprios tickets)
- `refunds:request` (solicitar reembolsos)
- `reviews:create` (criar avaliações)
- `wallet:own` (gerenciar própria carteira)

---

## Fluxo de Trabalho

### Fluxo de Ticket de Suporte

```
1. CUSTOMER cria ticket
   ↓
2. SUPPORT recebe e responde
   ↓
3. Se resolvido: SUPPORT fecha ticket
   Se complexo: SUPPORT escala para MANAGER
   ↓
4. MANAGER resolve e fecha ticket
```

### Fluxo de Reembolso

```
1. CUSTOMER solicita reembolso
   ↓
2. SUPPORT analisa e revisa (primeira análise)
   ↓
3. FINANCIAL aprova valor do reembolso
   ↓
4. MANAGER libera o pagamento
   ↓
5. Sistema processa reembolso automaticamente
```

### Fluxo de Relatórios Financeiros

```
1. Sistema gera relatórios automaticamente (diário, semanal, mensal)
   ↓
2. ADMIN acessa relatórios completos
   ↓
3. FINANCIAL acessa relatórios financeiros
   ↓
4. MANAGER acessa relatórios operacionais
```

---

## Permissões Detalhadas

### Tickets de Suporte
- `tickets:create` - Criar ticket (CUSTOMER)
- `tickets:read` - Ler tickets (SUPPORT, MANAGER, ADMIN)
- `tickets:own` - Ver próprios tickets (CUSTOMER)
- `tickets:respond` - Responder tickets (SUPPORT, MANAGER, ADMIN)
- `tickets:update` - Atualizar status (SUPPORT, MANAGER, ADMIN)
- `tickets:assign` - Atribuir tickets (MANAGER, ADMIN)
- `tickets:close` - Fechar tickets (SUPPORT, MANAGER, ADMIN)

### Reembolsos
- `refunds:request` - Solicitar reembolso (CUSTOMER)
- `refunds:review` - Revisar solicitação (SUPPORT, FINANCIAL)
- `refunds:approve` - Aprovar reembolso (FINANCIAL, MANAGER, ADMIN)
- `refunds:reject` - Rejeitar reembolso (FINANCIAL, MANAGER, ADMIN)
- `refunds:process` - Processar pagamento (FINANCIAL, MANAGER, ADMIN)
- `refunds:view-all` - Ver todos os reembolsos (MANAGER, ADMIN)

### Relatórios
- `reports:financial` - Relatórios financeiros (ADMIN, FINANCIAL)
- `reports:operational` - Relatórios operacionais (MANAGER, ADMIN)
- `reports:generate` - Gerar relatórios (ADMIN)
- `reports:export` - Exportar relatórios (ADMIN, FINANCIAL)

### Carteira
- `wallet:own` - Gerenciar própria carteira (CUSTOMER)
- `wallet:admin` - Gerenciar todas as carteiras (ADMIN, FINANCIAL)
- `wallet:bonus` - Adicionar bônus (ADMIN, MANAGER)
- `wallet:refund` - Estornar transações (ADMIN, FINANCIAL)

---

## Regras de Negócio

### RN039 - Separação de Responsabilidades
**Descrição:** Cada role tem responsabilidades específicas e não pode executar ações fora de seu escopo.

**Implementação:** Guards de roles e permissões

---

### RN040 - Fluxo de Aprovação de Reembolsos
**Descrição:** Reembolsos devem passar por 3 etapas: análise (SUPPORT), aprovação (FINANCIAL) e liberação (MANAGER).

**Critérios:**
- SUPPORT faz primeira análise e recomenda aprovação/rejeição
- FINANCIAL aprova valor do reembolso
- MANAGER libera o pagamento
- Sistema processa automaticamente após aprovação

---

### RN041 - Tickets Atribuídos
**Descrição:** Tickets devem ser atribuídos a um membro do suporte para garantir responsabilidade.

**Critérios:**
- Tickets novos ficam em fila
- MANAGER pode atribuir tickets
- SUPPORT pode pegar tickets da fila
- Apenas o responsável pode responder (ou MANAGER/ADMIN)

---

### RN042 - Relatórios Financeiros Restritos
**Descrição:** Apenas ADMIN e FINANCIAL podem acessar relatórios financeiros completos.

**Justificativa:** Proteger informações sensíveis da empresa

---

### RN043 - Auditoria de Ações Críticas
**Descrição:** Todas as ações de aprovação de reembolso e liberação de pagamento devem ser registradas.

**Implementação:** Campos de auditoria nas entidades (reviewedBy, approvedBy, processedBy)

---

## Endpoints por Role

### CUSTOMER
- POST /tickets (criar ticket)
- GET /tickets/my (ver próprios tickets)
- POST /tickets/:id/messages (responder ticket)
- POST /refunds (solicitar reembolso)
- GET /refunds/my (ver próprios reembolsos)
- GET /wallet/balance (ver saldo)
- GET /wallet/transactions (ver transações)

### SUPPORT
- GET /tickets (ver todos os tickets)
- GET /tickets/:id (ver detalhes)
- POST /tickets/:id/messages (responder)
- PUT /tickets/:id/status (atualizar status)
- GET /refunds (ver reembolsos para análise)
- PUT /refunds/:id/review (revisar reembolso)

### FINANCIAL
- GET /refunds (ver todos os reembolsos)
- PUT /refunds/:id/approve (aprovar reembolso)
- PUT /refunds/:id/reject (rejeitar reembolso)
- GET /reports/financial (relatórios financeiros)
- GET /wallet/admin/transactions (ver todas as transações)

### MANAGER
- GET /tickets (ver todos os tickets)
- PUT /tickets/:id/assign (atribuir tickets)
- GET /refunds (ver todos os reembolsos)
- PUT /refunds/:id/process (liberar pagamento)
- GET /reports/operational (relatórios operacionais)
- POST /products (gerenciar produtos)
- PUT /inventory (gerenciar estoque)

### ADMIN
- Acesso a todos os endpoints
- GET /reports/financial (relatórios financeiros completos)
- POST /reports/generate (gerar relatórios)
- PUT /users/:id/role (alterar role de usuários)
- GET /system/config (configurações do sistema)

---

## Implementação Técnica

### Guards
```typescript
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPPORT, UserRole.MANAGER, UserRole.ADMIN)
@Permissions('tickets:respond')
async respondTicket() { ... }
```

### Decorators
```typescript
@CurrentUser() user: any // Obtém usuário atual
@Roles(...roles) // Define roles permitidas
@Permissions(...permissions) // Define permissões necessárias
```

---

**Desenvolvido por:** Equipe Doce Encanto  
**Data:** Abril de 2026  
**Versão:** 1.0