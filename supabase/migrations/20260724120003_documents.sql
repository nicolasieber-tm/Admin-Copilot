-- Dokumente: documents, document_pages, document_analyses, document_entities
-- Referenz: Spez 15.4–15.7; ARCHITECTURE.md §3/§4

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  uploaded_by uuid not null references public.users (id),
  title text,
  original_filename text,
  storage_path text,
  mime_type text,
  page_count integer not null default 1 check (page_count > 0),
  file_size bigint,
  file_hash text,
  status public.document_status not null default 'uploaded',
  category text,
  subcategory text,
  detected_language text,
  document_date date,
  sender_name text,
  recipient_name text,
  requires_action boolean,
  contains_financial_impact boolean,
  analysis_confidence numeric(4,3),
  user_confirmed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index documents_workspace_status_idx on public.documents (workspace_id, status);
create index documents_workspace_created_idx on public.documents (workspace_id, created_at desc);
-- Duplikaterkennung (Spez 21.7): Hinweis statt Blockade, daher kein Unique-Constraint
create index documents_workspace_hash_idx on public.documents (workspace_id, file_hash);
create index documents_uploaded_by_idx on public.documents (uploaded_by);

create trigger set_documents_updated_at
before update on public.documents
for each row execute function private.set_updated_at();

create table public.document_pages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  page_number integer not null check (page_number > 0),
  image_storage_path text,
  extracted_text text,
  extraction_metadata jsonb,
  quality_score numeric(4,3),
  created_at timestamptz not null default now(),
  unique (document_id, page_number)
);

create index document_pages_workspace_idx on public.document_pages (workspace_id);

create table public.document_analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  analysis_version integer not null default 1 check (analysis_version > 0),
  provider text,
  model text,
  prompt_version text,
  classification_result jsonb,
  extraction_result jsonb,
  validation_result jsonb,
  explanation_result jsonb,
  status public.analysis_status not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  -- erneute Analyse = neuer Datensatz mit analysis_version + 1 (Spez 25.5)
  unique (document_id, analysis_version)
);

create index document_analyses_workspace_idx on public.document_analyses (workspace_id);

create table public.document_entities (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null,
  value_text text,
  value_json jsonb,
  page_number integer,
  source_text text,
  bounding_box jsonb,
  confidence numeric(4,3),
  confirmed_by_user boolean not null default false,
  corrected_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index document_entities_document_idx on public.document_entities (document_id);
create index document_entities_workspace_idx on public.document_entities (workspace_id);

create trigger set_document_entities_updated_at
before update on public.document_entities
for each row execute function private.set_updated_at();
