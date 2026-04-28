-- ============================================================
-- Seed: workspace de desenvolvimento + dados de teste
-- Executar APÓS as migrations 001, 002, 003
-- ============================================================

-- Substitua <USER_ID> pelo uuid do usuário admin criado via Auth
-- (visível em Authentication > Users no Supabase Dashboard)

do $$
declare
  ws_id  uuid := gen_random_uuid();
  user_id uuid := '<USER_ID>'; -- substitua após criar o primeiro usuário
  lead1  uuid := gen_random_uuid();
  lead2  uuid := gen_random_uuid();
  lead3  uuid := gen_random_uuid();
  lead4  uuid := gen_random_uuid();
  lead5  uuid := gen_random_uuid();
begin

  -- Workspace de teste
  insert into workspaces (id, name, slug, plan) values
    (ws_id, 'Acme Corp (Teste)', 'acme-teste', 'pro');

  -- Admin member
  insert into workspace_members (workspace_id, user_id, role) values
    (ws_id, user_id, 'admin');

  -- Leads
  insert into leads (id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value) values
    (lead1, ws_id, 'Ana Souza',    'ana@techco.com',    '(11) 99001-1234', 'TechCo',    'CTO',           'proposta',   user_id, 25000),
    (lead2, ws_id, 'Bruno Lima',   'bruno@venda.io',    '(21) 98002-5678', 'Venda.io',  'CEO',           'contato',    user_id, 8000),
    (lead3, ws_id, 'Carla Dias',   'carla@startup.br',  '(31) 97003-9012', 'Startup BR','Fundadora',     'negociacao', user_id, 42000),
    (lead4, ws_id, 'Diego Rocha',  'diego@corp.com.br', '(41) 96004-3456', 'Corp SA',   'Dir. Comercial','novo',       user_id, 5000),
    (lead5, ws_id, 'Elisa Cunha',  'elisa@agencia.me',  '(51) 95005-7890', 'Agência Me','Sócia',         'ganho',      user_id, 15000);

  -- Deals
  insert into deals (workspace_id, lead_id, title, value, stage, assignee_id, due_date) values
    (ws_id, lead1, 'Licença Enterprise TechCo',  25000, 'proposta',   user_id, current_date + 14),
    (ws_id, lead2, 'Plano Pro Venda.io',           8000, 'contato',    user_id, current_date + 30),
    (ws_id, lead3, 'Contrato Anual Startup BR',   42000, 'negociacao', user_id, current_date + 7),
    (ws_id, lead5, 'Onboarding Agência Me',       15000, 'ganho',      user_id, current_date - 5);

  -- Activities
  insert into activities (workspace_id, lead_id, type, description, author_id) values
    (ws_id, lead1, 'call',    'Ligação inicial — interesse confirmado em licença enterprise.', user_id),
    (ws_id, lead1, 'email',   'Enviada proposta comercial com desconto de 10%.', user_id),
    (ws_id, lead3, 'meeting', 'Reunião de apresentação do produto realizada via Google Meet.', user_id);

end $$;
