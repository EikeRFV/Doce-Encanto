# Regras de Negócio - API Doce Encanto

**Projeto:** Sistema de E-commerce para Velas Artesanais e Sabonetes Personalizados  
**Disciplina:** Desenvolvimento de APIs  
**Data:** Abril de 2026  
**Repositório:** https://github.com/[seu-usuario]/Doce-Encanto

---

## 1. Regras de Autenticação e Segurança

### RN001 - Validação de Senha Forte
**Descrição:** Todas as senhas de usuários devem seguir critérios de segurança rigorosos.

**Critérios:**
- Mínimo de 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial (@, $, !, %, *, ?, &)

**Implementação:** `src/modules/auth/dto/register.dto.ts` e `src/modules/users/dto/create-user.dto.ts`

**Exemplo de senha válida:** `Senha@123`  
**Exemplo de senha inválida:** `senha123` (falta maiúscula e caractere especial)

**Justificativa:** Proteger contas de usuários contra ataques de força bruta e garantir a segurança dos dados.

---

### RN002 - Validação de CPF
**Descrição:** O CPF informado deve ser válido segundo o algoritmo de validação oficial.

**Critérios:**
- Deve conter exatamente 11 dígitos numéricos
- Não pode ser uma sequência de números iguais (ex: 111.111.111-11)
- Os dígitos verificadores devem ser válidos

**Implementação:** `src/modules/auth/auth.service.ts` - método `validateCPF()`

**Algoritmo:**
1. Validar primeiro dígito verificador
2. Validar segundo dígito verificador
3. Rejeitar CPFs com todos os dígitos iguais

**Justificativa:** Garantir a autenticidade dos dados cadastrais e evitar fraudes.

---

### RN003 - Unicidade de Email
**Descrição:** Não é permitido cadastrar dois usuários com o mesmo endereço de email.

**Critérios:**
- Email deve ser único no sistema
- Validação case-insensitive (joao@email.com = JOAO@email.com)
- Formato de email válido

**Implementação:** `src/modules/auth/auth.service.ts` - método `register()`

**Mensagem de erro:** "Email já cadastrado"

**Justificativa:** Evitar duplicidade de contas e garantir que cada usuário tenha uma identificação única.

---

### RN004 - Unicidade de CPF
**Descrição:** Não é permitido cadastrar dois usuários com o mesmo CPF.

**Critérios:**
- CPF deve ser único no sistema
- Validação apenas de números (remover pontos e traços)

**Implementação:** `src/modules/auth/auth.service.ts` - método `register()`

**Mensagem de erro:** "CPF já cadastrado"

**Justificativa:** Evitar fraudes e garantir que cada pessoa física tenha apenas uma conta.

---

### RN005 - Bloqueio de Usuários Inativos
**Descrição:** Usuários marcados como inativos não podem fazer login no sistema.

**Critérios:**
- Verificar flag `isActive` antes de permitir login
- Usuários inativos não podem acessar recursos protegidos

**Implementação:** `src/modules/auth/auth.service.ts` - método `login()`

**Mensagem de erro:** "Usuário inativo"

**Justificativa:** Permitir que administradores desativem contas suspeitas ou que violem termos de uso.

---

## 2. Regras de Produtos

### RN006 - Geração Automática de Slug
**Descrição:** Todo produto deve ter um slug único gerado automaticamente a partir do nome.

**Critérios:**
- Converter para minúsculas
- Remover acentos
- Substituir espaços por hífens
- Remover caracteres especiais
- Garantir unicidade

**Implementação:** Service de produtos - método `generateSlug()`

**Exemplo:**
- Nome: "Vela Aromática Lavanda"
- Slug: "vela-aromatica-lavanda"

**Justificativa:** URLs amigáveis para SEO e melhor experiência do usuário.

---

### RN007 - Validação de Preço
**Descrição:** O preço de um produto deve ser sempre maior que zero.

**Critérios:**
- Preço > 0
- Formato decimal com 2 casas decimais
- Não permitir valores negativos

**Implementação:** Service de produtos - método `create()` e `update()`

**Mensagem de erro:** "O preço deve ser maior que zero"

**Justificativa:** Evitar erros de cadastro e garantir a integridade dos dados financeiros.

---

### RN008 - Controle de Estoque Não Negativo
**Descrição:** A quantidade em estoque de um produto não pode ser negativa.

**Critérios:**
- Estoque >= 0
- Validar antes de atualizar
- Bloquear vendas se estoque insuficiente

**Implementação:** Service de produtos - método `update()`

**Mensagem de erro:** "O estoque não pode ser negativo"

**Justificativa:** Manter a integridade do controle de estoque e evitar vendas de produtos indisponíveis.

---

### RN009 - Proteção de Produtos com Pedidos
**Descrição:** Produtos que possuem pedidos associados não podem ser deletados, apenas desativados.

**Critérios:**
- Verificar se existem pedidos antes de deletar
- Sugerir desativação ao invés de deleção
- Manter histórico de vendas

**Implementação:** Service de produtos - método `remove()`

**Mensagem de erro:** "Produto não pode ser deletado pois possui pedidos associados. Desative o produto ao invés de deletá-lo."

**Justificativa:** Preservar histórico de vendas e integridade referencial do banco de dados.

---

### RN010 - Atualização Automática de Média de Avaliações
**Descrição:** A média de avaliações de um produto deve ser recalculada automaticamente ao adicionar, aprovar ou rejeitar uma avaliação.

**Critérios:**
- Calcular média apenas de avaliações aprovadas
- Atualizar campo `averageRating` do produto
- Atualizar contador `reviewCount`

**Implementação:** Service de reviews - métodos `create()`, `approve()`, `reject()`

**Fórmula:** `averageRating = soma(ratings aprovados) / total de avaliações aprovadas`

**Justificativa:** Fornecer informação precisa e atualizada sobre a qualidade dos produtos.

---

## 3. Regras de Pedidos

### RN011 - Validação de Estoque ao Criar Pedido
**Descrição:** Antes de criar um pedido, o sistema deve validar se há estoque suficiente para todos os produtos.

**Critérios:**
- Verificar estoque de cada item
- Bloquear pedido se algum item estiver sem estoque
- Informar quais produtos estão indisponíveis

**Implementação:** Service de orders - método `create()`

**Mensagem de erro:** "Produto [nome] sem estoque suficiente. Disponível: [quantidade]"

**Justificativa:** Evitar venda de produtos indisponíveis e frustração do cliente.

---

### RN012 - Cálculo Automático de Valores do Pedido
**Descrição:** O sistema deve calcular automaticamente subtotal, desconto, frete e total do pedido.

**Critérios:**
- Subtotal = soma(preço unitário × quantidade) de todos os itens
- Desconto = aplicar cupom se válido
- Total = subtotal - desconto + frete

**Implementação:** Service de orders - método `calculateOrderTotals()`

**Fórmula:**
```
subtotal = Σ(item.unitPrice × item.quantity)
discount = aplicarCupom(subtotal, cupom)
total = subtotal - discount + shippingCost
```

**Justificativa:** Garantir precisão nos valores e evitar erros de cálculo manual.

---

### RN013 - Geração de Número Único de Pedido
**Descrição:** Cada pedido deve ter um número único e sequencial para identificação.

**Critérios:**
- Formato: YYYYMMDD-XXXX (ex: 20260427-0001)
- Sequencial por dia
- Único no sistema

**Implementação:** Service de orders - método `generateOrderNumber()`

**Exemplo:** 20260427-0001, 20260427-0002, etc.

**Justificativa:** Facilitar rastreamento e identificação de pedidos.

---

### RN014 - Validação de Cupom de Desconto
**Descrição:** Cupons de desconto devem ser validados antes de serem aplicados ao pedido.

**Critérios:**
- Cupom deve existir e estar ativo
- Data atual deve estar entre startDate e endDate
- Valor do pedido deve ser >= minPurchaseAmount
- Limite de uso não deve ter sido atingido

**Implementação:** Service de discounts - método `validateCoupon()`

**Mensagens de erro:**
- "Cupom inválido ou expirado"
- "Valor mínimo de compra não atingido: R$ [valor]"
- "Cupom já atingiu o limite de uso"

**Justificativa:** Garantir que apenas cupons válidos sejam aplicados e evitar fraudes.

---

### RN015 - Atualização de Estoque ao Confirmar Pagamento
**Descrição:** O estoque dos produtos deve ser decrementado apenas após a confirmação do pagamento.

**Critérios:**
- Não decrementar ao criar pedido (apenas reservar)
- Decrementar ao confirmar pagamento
- Reverter se pagamento for cancelado

**Implementação:** Service de orders - método `confirmPayment()`

**Fluxo:**
1. Criar pedido (status: PENDING)
2. Aguardar pagamento (status: PAYMENT_PENDING)
3. Confirmar pagamento → decrementar estoque (status: PAYMENT_CONFIRMED)

**Justificativa:** Evitar bloqueio desnecessário de estoque e permitir que outros clientes comprem enquanto o pagamento não é confirmado.

---

### RN016 - Restrição de Cancelamento Após Envio
**Descrição:** Pedidos não podem ser cancelados após serem marcados como enviados.

**Critérios:**
- Permitir cancelamento apenas nos status: PENDING, PAYMENT_PENDING, PAYMENT_CONFIRMED, PROCESSING
- Bloquear cancelamento nos status: SHIPPED, DELIVERED
- Permitir solicitação de devolução após entrega

**Implementação:** Service de orders - método `cancel()`

**Mensagem de erro:** "Pedido não pode ser cancelado após o envio. Solicite uma devolução."

**Justificativa:** Proteger a logística e evitar problemas com transportadoras.

---

### RN017 - Validação de Transições de Status
**Descrição:** As mudanças de status do pedido devem seguir um fluxo lógico e sequencial.

**Critérios:**
- PENDING → PAYMENT_PENDING → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- Permitir CANCELLED a partir de qualquer status antes de SHIPPED
- Permitir REFUNDED apenas após DELIVERED

**Implementação:** Service de orders - método `updateStatus()`

**Fluxo válido:**
```
PENDING → PAYMENT_PENDING → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   ↓            ↓                    ↓                ↓
CANCELLED    CANCELLED           CANCELLED        CANCELLED
                                                      ↓
                                                  REFUNDED
```

**Mensagem de erro:** "Transição de status inválida: [status atual] → [novo status]"

**Justificativa:** Manter a integridade do fluxo de pedidos e evitar inconsistências.

---

## 4. Regras de Avaliações

### RN018 - Restrição de Avaliação por Compra
**Descrição:** Usuários só podem avaliar produtos que efetivamente compraram.

**Critérios:**
- Verificar se existe pedido entregue com o produto
- Verificar se o pedido pertence ao usuário
- Marcar avaliação como "compra verificada"

**Implementação:** Service de reviews - método `create()`

**Mensagem de erro:** "Você só pode avaliar produtos que comprou"

**Justificativa:** Garantir autenticidade das avaliações e evitar spam ou avaliações falsas.

---

### RN019 - Validação de Nota
**Descrição:** A nota de uma avaliação deve estar entre 1 e 5 estrelas.

**Critérios:**
- Nota >= 1 e <= 5
- Apenas números inteiros
- Campo obrigatório

**Implementação:** DTO de review - validação com class-validator

**Mensagem de erro:** "A nota deve estar entre 1 e 5"

**Justificativa:** Padronizar o sistema de avaliação e facilitar cálculos de média.

---

### RN020 - Uma Avaliação por Produto por Usuário
**Descrição:** Cada usuário pode ter apenas uma avaliação por produto.

**Critérios:**
- Verificar se já existe avaliação do usuário para o produto
- Permitir edição da avaliação existente
- Não permitir duplicatas

**Implementação:** Service de reviews - método `create()`

**Mensagem de erro:** "Você já avaliou este produto. Edite sua avaliação existente."

**Justificativa:** Evitar manipulação de médias e garantir uma avaliação por cliente.

---

### RN021 - Moderação de Avaliações
**Descrição:** Avaliações devem ser aprovadas por um moderador antes de serem exibidas publicamente.

**Critérios:**
- Novas avaliações criadas com `isApproved = false`
- Apenas administradores podem aprovar/rejeitar
- Avaliações rejeitadas não aparecem no site

**Implementação:** Service de reviews - métodos `approve()` e `reject()`

**Justificativa:** Controlar qualidade do conteúdo e evitar avaliações ofensivas ou spam.

---

## 5. Regras de Endereços

### RN022 - Validação de CEP
**Descrição:** O CEP informado deve ser válido e estar no formato correto.

**Critérios:**
- Formato: 12345-678 ou 12345678
- 8 dígitos numéricos
- Validar com API externa (ViaCEP) se possível

**Implementação:** Service de addresses - método `create()`

**Mensagem de erro:** "CEP inválido"

**Justificativa:** Garantir precisão dos endereços de entrega e facilitar cálculo de frete.

---

### RN023 - Endereço Padrão Único
**Descrição:** Cada usuário pode ter apenas um endereço marcado como padrão.

**Critérios:**
- Ao definir novo endereço como padrão, remover flag de outros
- Sempre deve existir pelo menos um endereço padrão
- Validar antes de salvar

**Implementação:** Service de addresses - método `setDefault()`

**Justificativa:** Facilitar o processo de checkout e evitar confusão do usuário.

---

## 6. Regras de Descontos

### RN024 - Código de Cupom Único
**Descrição:** Cada cupom de desconto deve ter um código único no sistema.

**Critérios:**
- Código case-insensitive
- Apenas letras, números e hífens
- Mínimo 4 caracteres

**Implementação:** Entity de discount - constraint unique

**Mensagem de erro:** "Código de cupom já existe"

**Justificativa:** Evitar conflitos e garantir que cada cupom seja único.

---

### RN025 - Validação de Período de Validade
**Descrição:** Cupons só podem ser usados dentro do período de validade definido.

**Critérios:**
- Data atual >= startDate
- Data atual <= endDate
- Validar antes de aplicar desconto

**Implementação:** Service de discounts - método `validateCoupon()`

**Mensagem de erro:** "Cupom expirado" ou "Cupom ainda não está ativo"

**Justificativa:** Controlar campanhas promocionais e evitar uso indevido de cupons.

---

### RN026 - Limite de Uso de Cupom
**Descrição:** Cupons podem ter um limite de uso que deve ser respeitado.

**Critérios:**
- Verificar `usageCount < usageLimit`
- Incrementar contador ao usar
- Bloquear se limite atingido

**Implementação:** Service de discounts - método `useCoupon()`

**Mensagem de erro:** "Cupom já atingiu o limite de uso"

**Justificativa:** Controlar custos de campanhas promocionais e evitar prejuízos.

---

### RN027 - Valor Mínimo de Compra
**Descrição:** Alguns cupons só podem ser aplicados se o valor da compra atingir um mínimo.

**Critérios:**
- Verificar `orderSubtotal >= minPurchaseAmount`
- Informar valor mínimo necessário
- Validar antes de aplicar

**Implementação:** Service de discounts - método `validateCoupon()`

**Mensagem de erro:** "Valor mínimo de compra não atingido: R$ [valor]"

**Justificativa:** Garantir margem de lucro mínima e incentivar compras maiores.

---

## 7. Regras de Controle de Acesso

### RN028 - Hierarquia de Roles
**Descrição:** O sistema possui três níveis de acesso: ADMIN, MANAGER e CUSTOMER.

**Hierarquia:**
- **ADMIN**: Acesso total ao sistema
- **MANAGER**: Gerenciar produtos, categorias, pedidos e estoque
- **CUSTOMER**: Fazer compras e gerenciar próprio perfil

**Implementação:** Guards de roles e permissions

**Justificativa:** Separar responsabilidades e proteger operações sensíveis.

---

### RN029 - Permissões Granulares
**Descrição:** Além de roles, o sistema usa permissões específicas para cada operação.

**Exemplos:**
- CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT
- MANAGE_ALL_ORDERS, MODERATE_REVIEWS
- VIEW_REPORTS, EXPORT_REPORTS

**Implementação:** Enum de permissions e PermissionsGuard

**Justificativa:** Permitir controle fino de acesso e flexibilidade na atribuição de permissões.

---

### RN030 - Isolamento de Dados do Cliente
**Descrição:** Clientes só podem acessar seus próprios dados (pedidos, endereços, avaliações).

**Critérios:**
- Validar userId em todas as operações
- Administradores podem acessar dados de todos
- Managers podem acessar dados relacionados a operações

**Implementação:** Services - validação de ownership

**Mensagem de erro:** "Acesso negado"

**Justificativa:** Proteger privacidade dos usuários e cumprir LGPD.

## 7. Regras de Carteira de Créditos

### RN031 - Criação Automática de Carteira
**Descrição:** Ao criar um usuário, uma carteira é automaticamente criada com saldo zero.

**Critérios:**
- Carteira criada no registro do usuário
- Saldo inicial = R$ 0,00
- Uma carteira por usuário

**Implementação:** `src/modules/wallets/wallets.service.ts` - método `createWallet()`

**Justificativa:** Garantir que todos os usuários tenham acesso ao sistema de créditos desde o início.

---

### RN032 - Validação de Valor Mínimo para Recarga
**Descrição:** O valor mínimo para adicionar créditos à carteira é R$ 0,01.

**Critérios:**
- Valor >= R$ 0,01
- Valor <= R$ 10.000,00 por transação
- Validar antes de processar

**Implementação:** `src/modules/wallets/wallets.service.ts` - método `addCredits()`

**Mensagem de erro:** "Valor mínimo para recarga é R$ 0,01" ou "Valor máximo para recarga é R$ 10.000,00"

**Justificativa:** Evitar transações inválidas e proteger contra fraudes.

---

### RN033 - Validação de Saldo Suficiente
**Descrição:** Antes de usar créditos, o sistema deve validar se há saldo suficiente na carteira.

**Critérios:**
- Saldo atual >= valor a ser usado
- Bloquear transação se saldo insuficiente
- Informar saldo disponível

**Implementação:** `src/modules/wallets/wallets.service.ts` - método `useCredits()`

**Mensagem de erro:** "Saldo insuficiente. Saldo atual: R$ [valor]"

**Justificativa:** Evitar saldo negativo e garantir integridade financeira.

---

### RN034 - Transações Atômicas
**Descrição:** Todas as operações de crédito/débito devem ser atômicas (tudo ou nada).

**Critérios:**
- Usar transações de banco de dados
- Rollback em caso de erro
- Garantir consistência

**Implementação:** `src/modules/wallets/wallets.service.ts` - uso de `QueryRunner`

**Justificativa:** Garantir integridade dos dados financeiros e evitar inconsistências.

---

### RN035 - Estorno de Transações
**Descrição:** Apenas transações de débito podem ser estornadas, e apenas uma vez.

**Critérios:**
- Apenas débitos podem ser estornados
- Transação não pode estar já estornada
- Criar transação de estorno (REFUND)
- Devolver créditos ao saldo

**Implementação:** `src/modules/wallets/wallets.service.ts` - método `refundCredits()`

**Mensagem de erro:** "Apenas transações de débito podem ser estornadas" ou "Transação já foi estornada"

**Justificativa:** Permitir correção de erros e devoluções, mantendo histórico completo.

---

### RN036 - Bônus de Boas-Vindas
**Descrição:** Novos usuários recebem R$ 10,00 de créditos como bônus de boas-vindas.

**Critérios:**
- Valor fixo: R$ 10,00
- Apenas para novos usuários
- Adicionado automaticamente

**Implementação:** `src/modules/wallets/wallets.service.ts` - método `addWelcomeBonus()`

**Justificativa:** Incentivar primeiras compras e melhorar experiência do usuário.

---

### RN037 - Cashback em Compras
**Descrição:** Clientes recebem 5% de cashback em todas as compras confirmadas.

**Critérios:**
- Percentual fixo: 5%
- Aplicado após confirmação do pedido
- Créditos adicionados automaticamente

**Implementação:** `src/modules/wallets/wallets.service.ts` - método `addCashback()`

**Fórmula:** `cashback = valorPedido × 0.05`

**Exemplo:** Compra de R$ 100,00 → Cashback de R$ 5,00

**Justificativa:** Fidelizar clientes e incentivar novas compras.

---

### RN038 - Histórico Completo de Transações
**Descrição:** Todas as transações devem ser registradas com informações completas.

**Critérios:**
- Registrar tipo, valor, saldo anterior e novo
- Incluir descrição e referências
- Manter histórico permanente

**Implementação:** Entity `WalletTransaction`

**Tipos de transação:**
- CREDIT: Adição de créditos
- DEBIT: Uso de créditos
- REFUND: Estorno
- VOUCHER: Créditos de voucher
- PURCHASE: Compra com créditos

**Justificativa:** Transparência, auditoria e resolução de disputas.

---

---

## 8. Regras de Suporte e Reembolsos

### RN039 - Separação de Responsabilidades por Role
**Descrição:** Cada role tem responsabilidades específicas e não pode executar ações fora de seu escopo.

**Roles:**
- **ADMIN**: Acesso total ao sistema
- **MANAGER**: Gerencia produtos, estoque e libera pagamentos
- **FINANCIAL**: Aprova reembolsos e acessa relatórios financeiros
- **SUPPORT**: Atende clientes e analisa reembolsos
- **CUSTOMER**: Faz compras e abre tickets

**Implementação:** Guards de roles e permissões

**Justificativa:** Garantir segurança e separação de responsabilidades.

---

### RN040 - Fluxo de Aprovação de Reembolsos em 3 Etapas
**Descrição:** Reembolsos devem passar por análise, aprovação e liberação antes do processamento.

**Fluxo:**
1. **SUPPORT** analisa solicitação e recomenda (UNDER_REVIEW)
2. **FINANCIAL** aprova valor do reembolso (APPROVED)
3. **MANAGER** libera o pagamento (PROCESSING)
4. Sistema processa automaticamente (COMPLETED)

**Critérios:**
- Cada etapa deve ser executada por role diferente
- Registrar responsável e data de cada etapa
- Permitir rejeição em qualquer etapa

**Implementação:** `src/modules/refunds/refunds.service.ts`

**Justificativa:** Garantir controle e auditoria de reembolsos.

---

### RN041 - Geração Automática de Número de Ticket
**Descrição:** Cada ticket deve ter um número único e sequencial para rastreamento.

**Formato:** `TKT-YYYYMMDD-XXXX` (ex: TKT-20260427-0001)

**Critérios:**
- Sequencial por dia
- Único no sistema
- Gerado automaticamente

**Implementação:** Service de support - método `generateTicketNumber()`

**Justificativa:** Facilitar rastreamento e identificação de tickets.

---

### RN042 - Atribuição de Tickets
**Descrição:** Tickets devem ser atribuídos a um membro do suporte para garantir responsabilidade.

**Critérios:**
- Tickets novos ficam em fila (assignedToId = null)
- MANAGER pode atribuir tickets
- SUPPORT pode pegar tickets da fila
- Apenas o responsável pode responder (ou MANAGER/ADMIN)

**Implementação:** Service de support - método `assignTicket()`

**Justificativa:** Garantir que cada ticket tenha um responsável.

---

### RN043 - Priorização de Tickets
**Descrição:** Tickets devem ser priorizados automaticamente com base na categoria e conteúdo.

**Prioridades:**
- **URGENT**: Problemas de pagamento, pedidos não recebidos
- **HIGH**: Produtos defeituosos, reembolsos
- **MEDIUM**: Dúvidas sobre pedidos, conta
- **LOW**: Dúvidas gerais

**Implementação:** Service de support - método `calculatePriority()`

**Justificativa:** Garantir atendimento rápido para casos críticos.

---

### RN044 - Validação de Solicitação de Reembolso
**Descrição:** Apenas pedidos entregues há menos de 30 dias podem solicitar reembolso.

**Critérios:**
- Pedido deve estar com status DELIVERED
- Máximo 30 dias desde a entrega
- Não pode ter reembolso já solicitado
- Valor solicitado <= valor do pedido

**Implementação:** Service de refunds - método `validateRefundRequest()`

**Mensagem de erro:** "Prazo para solicitar reembolso expirado (máximo 30 dias)"

**Justificativa:** Proteger a empresa de fraudes e garantir prazo razoável.

---

### RN045 - Anexos em Tickets e Reembolsos
**Descrição:** Clientes podem anexar fotos e documentos para comprovar problemas.

**Critérios:**
- Máximo 5 arquivos por ticket/reembolso
- Formatos permitidos: JPG, PNG, PDF
- Tamanho máximo: 5MB por arquivo
- Armazenamento seguro

**Implementação:** Upload com Multer e validação

**Justificativa:** Facilitar análise e resolução de problemas.

---

### RN046 - Relatórios Financeiros Automatizados
**Descrição:** Sistema gera relatórios financeiros automaticamente em períodos definidos.

**Tipos:**
- **DAILY**: Gerado todo dia às 00:00
- **WEEKLY**: Gerado toda segunda-feira
- **MONTHLY**: Gerado no primeiro dia do mês
- **QUARTERLY**: Gerado no início de cada trimestre
- **YEARLY**: Gerado no início do ano

**Métricas incluídas:**
- Receita total e líquida
- Total de pedidos e status
- Valor médio de pedido
- Novos vs. clientes recorrentes
- Produtos e categorias mais vendidos
- Métodos de pagamento
- Uso de créditos da carteira

**Implementação:** Task scheduling com `@nestjs/schedule`

**Justificativa:** Facilitar declarações fiscais e análise de desempenho.

---

### RN047 - Auditoria de Ações Críticas
**Descrição:** Todas as ações de aprovação de reembolso e liberação de pagamento devem ser registradas.

**Campos de auditoria:**
- reviewedBy, reviewedAt, reviewNotes
- approvedBy, approvedAt, approvalNotes
- processedBy, processedAt, processingNotes

**Implementação:** Campos nas entidades RefundRequest e WalletTransaction

**Justificativa:** Rastreabilidade e conformidade legal.

---

### RN048 - Restrição de Acesso a Relatórios Financeiros
**Descrição:** Apenas ADMIN e FINANCIAL podem acessar relatórios financeiros completos.

**Critérios:**
- ADMIN: Acesso total a todos os relatórios
- FINANCIAL: Acesso a relatórios financeiros
- MANAGER: Acesso apenas a relatórios operacionais
- Outros roles: Sem acesso

**Implementação:** Guards de permissões

**Justificativa:** Proteger informações sensíveis da empresa.

---

## 8. Resumo de Implementação

### Regras Implementadas (28+)

**Autenticação e Segurança:**
1. ✅ **RN001** - Validação de Senha Forte
2. ✅ **RN002** - Validação de CPF
3. ✅ **RN003** - Unicidade de Email
4. ✅ **RN004** - Unicidade de CPF
5. ✅ **RN005** - Bloqueio de Usuários Inativos

**Produtos:**
6. ✅ **RN006** - Geração Automática de Slug
7. ✅ **RN007** - Validação de Preço
8. ✅ **RN008** - Controle de Estoque Não Negativo
9. ✅ **RN009** - Proteção de Produtos com Pedidos
10. ✅ **RN010** - Atualização Automática de Média de Avaliações

**Pedidos:**
11. 🔨 **RN011** - Validação de Estoque ao Criar Pedido
12. 🔨 **RN012** - Cálculo Automático de Valores do Pedido
13. 🔨 **RN013** - Geração de Número Único de Pedido
14. 🔨 **RN014** - Validação de Cupom de Desconto
15. 🔨 **RN015** - Atualização de Estoque ao Confirmar Pagamento

**Carteira de Créditos:**
16. ✅ **RN031** - Criação Automática de Carteira
17. ✅ **RN032** - Validação de Valor Mínimo para Recarga
18. ✅ **RN033** - Validação de Saldo Suficiente
19. ✅ **RN034** - Transações Atômicas
20. ✅ **RN035** - Estorno de Transações
21. ✅ **RN036** - Bônus de Boas-Vindas
22. ✅ **RN037** - Cashback em Compras
23. ✅ **RN038** - Histórico Completo de Transações

**Suporte e Reembolsos:**
24. ✅ **RN039** - Separação de Responsabilidades por Role
25. ✅ **RN040** - Fluxo de Aprovação de Reembolsos em 3 Etapas
26. ✅ **RN041** - Geração Automática de Número de Ticket
27. ✅ **RN042** - Atribuição de Tickets
28. ✅ **RN043** - Priorização de Tickets
29. ✅ **RN044** - Validação de Solicitação de Reembolso
30. ✅ **RN045** - Anexos em Tickets e Reembolsos
31. ✅ **RN046** - Relatórios Financeiros Automatizados
32. ✅ **RN047** - Auditoria de Ações Críticas
33. ✅ **RN048** - Restrição de Acesso a Relatórios Financeiros

**Legenda:**
- ✅ Implementada e testada
- 🔨 Estrutura criada, aguardando implementação completa

**Total: 28 regras implementadas + 5 em desenvolvimento = 33 regras de negócio**

---

## 9. Tecnologias Utilizadas

- **NestJS** - Framework backend
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e filas
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **BullMQ** - Processamento de filas
- **CQRS** - Separação de comandos e queries
- **class-validator** - Validação de DTOs
- **bcrypt** - Hash de senhas

---

## 10. Conclusão

Este documento apresenta as principais regras de negócio implementadas no sistema Doce Encanto. As regras foram desenvolvidas com foco em:

- **Segurança**: Validações rigorosas e controle de acesso
- **Integridade**: Garantia de consistência dos dados
- **Usabilidade**: Facilitar a experiência do usuário
- **Escalabilidade**: Preparado para crescimento
- **Manutenibilidade**: Código limpo e bem documentado

Todas as regras estão implementadas seguindo as melhores práticas de desenvolvimento e os padrões do NestJS.

---

**Desenvolvido por:** [Seu Nome]  
**Data:** Abril de 2026  
**Versão:** 1.0