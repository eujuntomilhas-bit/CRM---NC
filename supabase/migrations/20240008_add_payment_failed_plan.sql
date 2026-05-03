-- Adiciona 'payment_failed' como valor válido para a coluna plan em workspaces.
-- Necessário para o webhook invoice.payment_failed marcar workspaces com falha de pagamento.

alter table workspaces
  drop constraint if exists workspaces_plan_check;

alter table workspaces
  add constraint workspaces_plan_check
  check (plan in ('free', 'pro', 'payment_failed'));
