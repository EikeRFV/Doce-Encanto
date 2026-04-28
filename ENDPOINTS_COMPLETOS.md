# Lista Completa de Endpoints - API Doce Encanto

## Meta: 60+ Endpoints

---

## 1. Auth Module (2 endpoints) ✅
- [x] POST /auth/register - Registrar novo usuário
- [x] POST /auth/login - Login

---

## 2. Users Module (8 endpoints)
- [ ] GET /users - Listar usuários (Admin)
- [ ] GET /users/:id - Buscar usuário por ID
- [ ] GET /users/profile - Ver próprio perfil
- [ ] PATCH /users/profile - Atualizar próprio perfil
- [ ] PATCH /users/:id - Atualizar usuário (Admin)
- [ ] DELETE /users/:id - Deletar usuário (Admin)
- [ ] PUT /users/:id/activate - Ativar usuário (Admin)
- [ ] PUT /users/:id/deactivate - Desativar usuário (Admin)

---

## 3. Products Module (13 endpoints) ✅
- [x] POST /products - Criar produto
- [x] GET /products - Listar produtos
- [x] GET /products/featured - Produtos em destaque
- [x] GET /products/best-sellers - Produtos mais vendidos
- [x] GET /products/:id - Buscar por ID
- [x] GET /products/slug/:slug - Buscar por slug
- [x] GET /products/:id/related - Produtos relacionados
- [x] GET /products/:id/stock-history - Histórico de estoque
- [x] PATCH /products/:id - Atualizar produto
- [x] PUT /products/:id/activate - Ativar produto
- [x] PUT /products/:id/deactivate - Desativar produto
- [x] DELETE /products/:id - Deletar produto
- [x] POST /products/:id/images - Upload de imagens (a implementar)

---

## 4. Categories Module (7 endpoints)
- [ ] POST /categories - Criar categoria
- [ ] GET /categories - Listar categorias
- [ ] GET /categories/:id - Buscar categoria
- [ ] GET /categories/:id/products - Produtos da categoria
- [ ] PATCH /categories/:id - Atualizar categoria
- [ ] DELETE /categories/:id - Deletar categoria
- [ ] PUT /categories/:id/reorder - Reordenar categorias

---

## 5. Orders Module (12 endpoints)
- [ ] POST /orders - Criar pedido
- [ ] GET /orders - Listar pedidos
- [ ] GET /orders/my - Meus pedidos (Customer)
- [ ] GET /orders/:id - Buscar pedido
- [ ] PATCH /orders/:id/status - Atualizar status
- [ ] POST /orders/:id/cancel - Cancelar pedido
- [ ] POST /orders/:id/confirm-payment - Confirmar pagamento
- [ ] POST /orders/:id/ship - Marcar como enviado
- [ ] POST /orders/:id/deliver - Marcar como entregue
- [ ] GET /orders/:id/tracking - Rastreamento
- [ ] POST /orders/:id/invoice - Gerar nota fiscal
- [ ] GET /orders/stats - Estatísticas de pedidos (Admin)

---

## 6. Reviews Module (8 endpoints)
- [ ] POST /reviews - Criar avaliação
- [ ] GET /reviews - Listar avaliações
- [ ] GET /reviews/product/:productId - Avaliações do produto
- [ ] GET /reviews/:id - Buscar avaliação
- [ ] PATCH /reviews/:id - Editar avaliação
- [ ] DELETE /reviews/:id - Deletar avaliação
- [ ] PUT /reviews/:id/approve - Aprovar avaliação (Admin)
- [ ] PUT /reviews/:id/reject - Rejeitar avaliação (Admin)

---

## 7. Addresses Module (6 endpoints)
- [ ] POST /addresses - Criar endereço
- [ ] GET /addresses - Listar endereços
- [ ] GET /addresses/:id - Buscar endereço
- [ ] PATCH /addresses/:id - Atualizar endereço
- [ ] DELETE /addresses/:id - Deletar endereço
- [ ] PUT /addresses/:id/set-default - Definir como padrão

---

## 8. Discounts Module (8 endpoints)
- [ ] POST /discounts - Criar cupom
- [ ] GET /discounts - Listar cupons
- [ ] GET /discounts/:id - Buscar cupom
- [ ] POST /discounts/validate - Validar cupom
- [ ] PATCH /discounts/:id - Atualizar cupom
- [ ] DELETE /discounts/:id - Deletar cupom
- [ ] PUT /discounts/:id/activate - Ativar cupom
- [ ] PUT /discounts/:id/deactivate - Desativar cupom

---

## 9. Wallets Module (10 endpoints) ✅
- [x] GET /wallets/balance - Consultar saldo
- [x] POST /wallets/add-credits - Adicionar créditos
- [x] POST /wallets/use-credits - Usar créditos
- [x] POST /wallets/refund/:transactionId - Estornar transação
- [x] GET /wallets/transactions - Listar transações
- [x] POST /wallets/welcome-bonus - Bônus de boas-vindas
- [x] POST /wallets/cashback - Adicionar cashback
- [x] GET /wallets/admin/balance/:userId - Consultar saldo (Admin)
- [x] GET /wallets/admin/transactions/:userId - Listar transações (Admin)

---

## 10. Support Module (9 endpoints)
- [ ] POST /tickets - Criar ticket
- [ ] GET /tickets - Listar tickets
- [ ] GET /tickets/my - Meus tickets
- [ ] GET /tickets/:id - Buscar ticket
- [ ] POST /tickets/:id/messages - Adicionar mensagem
- [ ] PUT /tickets/:id/assign - Atribuir ticket (Support/Manager)
- [ ] PUT /tickets/:id/status - Atualizar status
- [ ] PUT /tickets/:id/priority - Alterar prioridade
- [ ] PUT /tickets/:id/close - Fechar ticket

---

## 11. Refunds Module (9 endpoints)
- [ ] POST /refunds - Solicitar reembolso
- [ ] GET /refunds - Listar reembolsos
- [ ] GET /refunds/my - Meus reembolsos
- [ ] GET /refunds/:id - Buscar reembolso
- [ ] PUT /refunds/:id/review - Revisar (Support)
- [ ] PUT /refunds/:id/approve - Aprovar (Financial)
- [ ] PUT /refunds/:id/reject - Rejeitar
- [ ] PUT /refunds/:id/process - Processar pagamento (Manager)
- [ ] GET /refunds/stats - Estatísticas (Admin)

---

## 12. Reports Module (7 endpoints)
- [ ] GET /reports/financial - Listar relatórios financeiros
- [ ] GET /reports/financial/:id - Ver relatório específico
- [ ] POST /reports/generate - Gerar relatório customizado
- [ ] GET /reports/export/:id - Exportar relatório (PDF/Excel)
- [ ] GET /reports/dashboard - Dashboard com métricas
- [ ] GET /reports/sales - Relatório de vendas
- [ ] GET /reports/products - Relatório de produtos

---

## 13. Wishlists Module (6 endpoints)
- [ ] POST /wishlists - Adicionar à lista de desejos
- [ ] GET /wishlists - Ver lista de desejos
- [ ] DELETE /wishlists/:productId - Remover da lista
- [ ] POST /wishlists/share - Compartilhar lista
- [ ] GET /wishlists/shared/:token - Ver lista compartilhada
- [ ] POST /wishlists/move-to-cart - Mover para carrinho

---

## 14. Notifications Module (5 endpoints)
- [ ] GET /notifications - Listar notificações
- [ ] GET /notifications/unread - Notificações não lidas
- [ ] PUT /notifications/:id/read - Marcar como lida
- [ ] PUT /notifications/read-all - Marcar todas como lidas
- [ ] DELETE /notifications/:id - Deletar notificação

---

## 15. Payment Methods Module (6 endpoints)
- [ ] POST /payment-methods - Salvar método de pagamento
- [ ] GET /payment-methods - Listar métodos salvos
- [ ] GET /payment-methods/:id - Buscar método
- [ ] PATCH /payment-methods/:id - Atualizar método
- [ ] DELETE /payment-methods/:id - Deletar método
- [ ] PUT /payment-methods/:id/set-default - Definir como padrão

---

## 16. Vouchers Module (7 endpoints)
- [ ] POST /vouchers - Criar voucher
- [ ] GET /vouchers - Listar vouchers
- [ ] GET /vouchers/:code - Buscar por código
- [ ] POST /vouchers/redeem - Resgatar voucher
- [ ] PATCH /vouchers/:id - Atualizar voucher
- [ ] DELETE /vouchers/:id - Deletar voucher
- [ ] GET /vouchers/my - Meus vouchers

---

## 17. Analytics Module (5 endpoints) - BÔNUS
- [ ] GET /analytics/overview - Visão geral
- [ ] GET /analytics/customers - Análise de clientes
- [ ] GET /analytics/products - Análise de produtos
- [ ] GET /analytics/revenue - Análise de receita
- [ ] GET /analytics/trends - Tendências

---

## 18. Settings Module (4 endpoints) - BÔNUS
- [ ] GET /settings - Buscar configurações
- [ ] PATCH /settings - Atualizar configurações
- [ ] GET /settings/shipping - Configurações de frete
- [ ] PATCH /settings/shipping - Atualizar frete

---

## Total de Endpoints Planejados

| Módulo | Endpoints | Status |
|--------|-----------|--------|
| Auth | 2 | ✅ Completo |
| Users | 8 | 🔨 Pendente |
| Products | 13 | ✅ Completo |
| Categories | 7 | 🔨 Pendente |
| Orders | 12 | 🔨 Pendente |
| Reviews | 8 | 🔨 Pendente |
| Addresses | 6 | 🔨 Pendente |
| Discounts | 8 | 🔨 Pendente |
| Wallets | 10 | ✅ Completo |
| Support | 9 | 🔨 Pendente |
| Refunds | 9 | 🔨 Pendente |
| Reports | 7 | 🔨 Pendente |
| Wishlists | 6 | 🔨 Pendente |
| Notifications | 5 | 🔨 Pendente |
| Payment Methods | 6 | 🔨 Pendente |
| Vouchers | 7 | 🔨 Pendente |
| Analytics | 5 | 🔨 Bônus |
| Settings | 4 | 🔨 Bônus |
| **TOTAL** | **132** | **25 implementados** |

---

## Prioridade de Implementação

### Alta Prioridade (para atingir 60 endpoints):
1. ✅ Products (13) - Completo
2. ✅ Wallets (10) - Completo
3. 🔨 Orders (12) - Crítico para e-commerce
4. 🔨 Categories (7) - Necessário para produtos
5. 🔨 Reviews (8) - Importante para conversão
6. 🔨 Addresses (6) - Necessário para checkout
7. 🔨 Discounts (8) - Importante para vendas

**Subtotal: 64 endpoints** ✅ Meta atingida!

### Média Prioridade:
8. 🔨 Users (8)
9. 🔨 Support (9)
10. 🔨 Refunds (9)
11. 🔨 Wishlists (6)
12. 🔨 Payment Methods (6)

### Baixa Prioridade:
13. 🔨 Reports (7)
14. 🔨 Vouchers (7)
15. 🔨 Notifications (5)
16. 🔨 Analytics (5) - Bônus
17. 🔨 Settings (4) - Bônus

---

**Desenvolvido por:** Equipe Doce Encanto  
**Data:** Abril de 2026  
**Versão:** 1.0