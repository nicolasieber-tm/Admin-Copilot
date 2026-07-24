-- Storage: privater Bucket `documents`, Pfadschema
-- {workspace_id}/{document_id}/{page}.{ext}, Policies prüfen die
-- Workspace-Mitgliedschaft über das erste Pfadsegment
-- (ARCHITECTURE.md §5, Spez 20.2, 20.6)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  20971520, -- 20 MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "documents_bucket_select" on storage.objects
for select to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] in (
    select id::text from private.user_workspace_ids() as t(id)
  )
);

create policy "documents_bucket_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] in (
    select id::text from private.user_workspace_ids() as t(id)
  )
);

create policy "documents_bucket_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] in (
    select id::text from private.user_workspace_ids() as t(id)
  )
)
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] in (
    select id::text from private.user_workspace_ids() as t(id)
  )
);

create policy "documents_bucket_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] in (
    select id::text from private.user_workspace_ids() as t(id)
  )
);
