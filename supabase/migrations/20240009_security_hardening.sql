-- ============================================================
-- Migration 9: Security Hardening (M11)
-- ============================================================
-- Aumenta entropia do token de convite de 122 bits (UUID) para
-- 256 bits (gen_random_bytes(32) em hex), eliminando qualquer
-- risco teórico de colisão ou previsibilidade.

alter table invites
  alter column token set default encode(gen_random_bytes(32), 'hex');

-- Garante que tokens existentes (UUID format) continuam válidos —
-- a constraint unique já existe, não precisa recriar.
