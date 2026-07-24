-- Fundament: privates Schema, Enums, Hilfsfunktionen
-- Referenz: ARCHITECTURE.md §4/§5, Spez Kap. 15 und 25

create schema if not exists private;

-- Enums --------------------------------------------------------------------

create type public.workspace_type as enum ('personal', 'organization');

create type public.workspace_role as enum (
  'owner', 'member', 'advisor', 'case_manager', 'organization_admin'
);

create type public.member_status as enum ('active', 'invited', 'removed');

-- Spez 25.1: grober, nutzersichtbarer Dokumentzustand
create type public.document_status as enum (
  'uploaded', 'processing', 'ready_for_review', 'confirmed',
  'action_open', 'completed', 'archived', 'failed'
);

-- Spez 11.4: feiner Pipeline-Zustand pro Analyse-Lauf
create type public.analysis_status as enum (
  'pending', 'preprocessing', 'text_extraction', 'classification',
  'structured_extraction', 'validation', 'explanation_generation',
  'completed', 'failed'
);

-- Spez 25.2
create type public.task_status as enum (
  'open', 'in_progress', 'waiting', 'completed', 'not_required', 'overdue'
);

-- Spez 12.8 Handlungsarten
create type public.task_action_type as enum (
  'pay', 'check', 'respond', 'call', 'fill_form', 'send_documents',
  'schedule_appointment', 'file', 'other'
);

create type public.task_priority as enum ('low', 'medium', 'high', 'critical');

create type public.task_source as enum ('manual', 'document');

-- Spez 12.9 MVP-Kanäle
create type public.reminder_channel as enum ('in_app', 'email');

-- Spez 25.4
create type public.reminder_status as enum ('scheduled', 'sent', 'failed', 'cancelled');

create type public.budget_item_type as enum ('income', 'expense');

-- Spez 25.3
create type public.budget_item_status as enum (
  'planned', 'due', 'paid', 'received', 'postponed', 'cancelled'
);

create type public.budget_item_source as enum ('manual', 'document');

create type public.recurrence_frequency as enum (
  'weekly', 'monthly', 'quarterly', 'semiannual', 'yearly'
);

-- Spez 12.6 Darstellungsmodi
create type public.explanation_mode as enum ('normal', 'simple');

-- Hilfsfunktionen -----------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
