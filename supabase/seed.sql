-- ============================================================
-- Seed: dados de teste sem usuário
-- Executar APÓS as migrations 001, 002, 003
-- workspace_members e assignee_id omitidos — adicione depois
-- ============================================================

do $$
declare
  ws_id uuid := gen_random_uuid();
  lead1 uuid := gen_random_uuid();
  lead2 uuid := gen_random_uuid();
  lead3 uuid := gen_random_uuid();
  lead4 uuid := gen_random_uuid();
  lead5 uuid := gen_random_uuid();
begin

  insert into workspaces (id, name, slug, plan) values
    (ws_id, 'Acme Corp (Teste)', 'acme-teste', 'pro');

  insert into leads (id, workspace_id, name, email, phone, company, role, status, estimated_value) values
    (lead1, ws_id, 'Ana Souza',   'ana@techco.com',    '(11) 99001-1234', 'TechCo',    'CTO',           'proposta',   25000),
    (lead2, ws_id, 'Bruno Lima',  'bruno@venda.io',    '(21) 98002-5678', 'Venda.io',  'CEO',           'contato',    8000),
    (lead3, ws_id, 'Carla Dias',  'carla@startup.br',  '(31) 97003-9012', 'Startup BR','Fundadora',     'negociacao', 42000),
    (lead4, ws_id, 'Diego Rocha', 'diego@corp.com.br', '(41) 96004-3456', 'Corp SA',   'Dir. Comercial','novo',       5000),
    (lead5, ws_id, 'Elisa Cunha', 'elisa@agencia.me',  '(51) 95005-7890', 'Agência Me','Sócia',         'ganho',      15000);

  insert into deals (workspace_id, lead_id, title, value, stage, due_date) values
    (ws_id, lead1, 'Licença Enterprise TechCo', 25000, 'proposta',   current_date + 14),
    (ws_id, lead2, 'Plano Pro Venda.io',          8000, 'contato',    current_date + 30),
    (ws_id, lead3, 'Contrato Anual Startup BR',  42000, 'negociacao', current_date + 7),
    (ws_id, lead5, 'Onboarding Agência Me',      15000, 'ganho',      current_date - 5);

  insert into activities (workspace_id, lead_id, type, description) values
    (ws_id, lead1, 'call',    'Ligação inicial — interesse confirmado em licença enterprise.'),
    (ws_id, lead1, 'email',   'Enviada proposta comercial com desconto de 10%.'),
    (ws_id, lead3, 'meeting', 'Reunião de apresentação do produto realizada via Google Meet.');

  raise notice 'Seed concluído. Workspace id: %', ws_id;

end $$;
