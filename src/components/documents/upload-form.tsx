"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { de } from "@/lib/i18n/de";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPE,
  MAX_FILE_SIZE,
  fileExtension,
  formatDate,
  formatFileSize,
  hashFiles,
} from "@/lib/documents";
import { convertHeicToJpeg, isHeicFile } from "@/lib/heic";
import {
  FormError,
  FormNotice,
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/components/common/form";

type SelectedFile = {
  file: File;
  previewUrl: string | null;
};

// Best-Effort-Scan des Swiss-QR-Codes direkt beim Upload (deterministisch,
// ARCHITECTURE.md §1). Nutzt die BarcodeDetector-API, wo verfügbar –
// ohne sie extrahiert später die Pipeline die Werte aus dem Dokumenttext.
async function scanQrCode(file: File): Promise<string | null> {
  try {
    const DetectorCtor = (
      window as unknown as {
        BarcodeDetector?: new (options: { formats: string[] }) => {
          detect: (source: ImageBitmap) => Promise<{ rawValue?: string }[]>;
        };
      }
    ).BarcodeDetector;
    if (!DetectorCtor) return null;
    const bitmap = await createImageBitmap(file);
    const detector = new DetectorCtor({ formats: ["qr_code"] });
    const codes = await detector.detect(bitmap);
    bitmap.close();
    const value = codes[0]?.rawValue;
    return typeof value === "string" && value.startsWith("SPC") ? value : null;
  } catch {
    return null;
  }
}

export function UploadForm({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const skipDuplicateCheck = useRef(false);

  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const hasPdf = selected.some((s) => s.file.type === ACCEPTED_PDF_TYPE);

  useEffect(() => {
    return () => {
      selected.forEach((s) => {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      });
    };
  }, [selected]);

  function validateFile(file: File): string | null {
    if (![...ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPE].includes(file.type)) {
      return de.upload.errors.unsupportedType;
    }
    if (file.size > MAX_FILE_SIZE) {
      return de.upload.errors.tooLarge(file.name);
    }
    return null;
  }

  async function addFiles(fileList: FileList | File[] | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setDuplicateNotice(null);
    skipDuplicateCheck.current = false;

    let incoming = Array.from(fileList);

    if (incoming.some(isHeicFile)) {
      setConverting(true);
      try {
        incoming = await Promise.all(
          incoming.map((file) =>
            isHeicFile(file) ? convertHeicToJpeg(file) : file
          )
        );
      } catch {
        setConverting(false);
        setError(de.upload.errors.heicFailed);
        return;
      }
      setConverting(false);
    }

    for (const file of incoming) {
      const problem = validateFile(file);
      if (problem) {
        setError(problem);
        return;
      }
    }

    const incomingHasPdf = incoming.some((f) => f.type === ACCEPTED_PDF_TYPE);
    const incomingHasImage = incoming.some((f) =>
      ACCEPTED_IMAGE_TYPES.includes(f.type)
    );
    const existingHasImage = selected.some((s) =>
      ACCEPTED_IMAGE_TYPES.includes(s.file.type)
    );

    if (incomingHasPdf && (incomingHasImage || existingHasImage)) {
      setError(de.upload.errors.mixed);
      return;
    }
    if (incomingHasPdf && (hasPdf || incoming.length > 1)) {
      setError(de.upload.errors.onePdf);
      return;
    }
    if (incomingHasImage && hasPdf) {
      setError(de.upload.errors.mixed);
      return;
    }

    const next = incoming.map((file) => ({
      file,
      previewUrl: ACCEPTED_IMAGE_TYPES.includes(file.type)
        ? URL.createObjectURL(file)
        : null,
    }));
    setSelected((prev) => (incomingHasPdf ? next : [...prev, ...next]));
  }

  function removeFile(index: number) {
    setSelected((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setDuplicateNotice(null);
    skipDuplicateCheck.current = false;
  }

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (selected.length === 0) {
      setError(de.upload.errors.noFiles);
      return;
    }
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const files = selected.map((s) => s.file);
    const isPdf = files[0].type === ACCEPTED_PDF_TYPE;

    try {
      const fileHash = await hashFiles(files);

      // Duplikaterkennung (Spez 21.7): Hinweis statt Blockade
      if (!skipDuplicateCheck.current) {
        const { data: duplicate } = await supabase
          .from("documents")
          .select("id, created_at")
          .eq("workspace_id", workspaceId)
          .eq("file_hash", fileHash)
          .is("deleted_at", null)
          .limit(1)
          .maybeSingle();
        if (duplicate) {
          setDuplicateNotice(
            de.upload.duplicateHint(formatDate(duplicate.created_at))
          );
          skipDuplicateCheck.current = true;
          setUploading(false);
          return;
        }
      }

      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const documentTitle =
        title.trim() || files[0].name.replace(/\.[^.]+$/, "");

      const { data: doc, error: insertError } = await supabase
        .from("documents")
        .insert({
          workspace_id: workspaceId,
          uploaded_by: userId,
          title: documentTitle,
          original_filename: files[0].name,
          mime_type: files[0].type,
          page_count: isPdf ? 1 : files.length,
          file_size: totalSize,
          file_hash: fileHash,
          status: "uploaded",
        })
        .select("id")
        .single();

      if (insertError || !doc) throw insertError;

      const storagePath = `${workspaceId}/${doc.id}`;
      const uploadedPaths: string[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const path = `${storagePath}/${i + 1}.${fileExtension(file.type)}`;
          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(path, file, { contentType: file.type, upsert: false });
          if (uploadError) throw uploadError;
          uploadedPaths.push(path);
        }

        const qrPayloads = isPdf
          ? files.map(() => null)
          : await Promise.all(files.map((file) => scanQrCode(file)));

        const { error: pagesError } = await supabase
          .from("document_pages")
          .insert(
            uploadedPaths.map((path, i) => ({
              document_id: doc.id,
              workspace_id: workspaceId,
              page_number: i + 1,
              image_storage_path: path,
              extraction_metadata: qrPayloads[i]
                ? { qr_raw: qrPayloads[i] }
                : null,
            }))
          );
        if (pagesError) throw pagesError;

        const { error: updateError } = await supabase
          .from("documents")
          .update({ storage_path: storagePath })
          .eq("id", doc.id);
        if (updateError) throw updateError;
      } catch (innerError) {
        // Aufräumen, damit keine halben Dokumente zurückbleiben
        if (uploadedPaths.length > 0) {
          await supabase.storage.from("documents").remove(uploadedPaths);
        }
        await supabase.from("documents").delete().eq("id", doc.id);
        throw innerError;
      }

      router.push(`/documents/${doc.id}`);
      router.refresh();
    } catch {
      setError(de.upload.errors.failed);
      setUploading(false);
    }
  }

  return (
    <form onSubmit={upload} className="flex flex-col gap-5">
      <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm leading-relaxed text-accent-strong">
        {de.upload.privacy}
      </p>

      <FormError message={error} />
      <FormNotice message={duplicateNotice} />

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif,application/pdf"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {selected.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col gap-3 rounded-2xl border-2 border-dashed p-5 transition ${
            dragActive
              ? "border-accent bg-accent-soft/60"
              : "border-black/10 bg-surface"
          }`}
        >
          <button
            type="button"
            disabled={converting}
            className={buttonPrimaryClass}
            onClick={() => cameraInput.current?.click()}
          >
            {de.upload.takePhoto}
          </button>
          <button
            type="button"
            disabled={converting}
            className={buttonSecondaryClass}
            onClick={() => fileInput.current?.click()}
          >
            {converting ? de.upload.converting : de.upload.pickFile}
          </button>
          <p className="text-center text-xs text-muted">{de.upload.dropHint}</p>
          <p className="text-center text-xs text-muted">{de.upload.hint}</p>
        </div>
      ) : (
        <>
          <section
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <h2 className="mb-2 text-sm font-semibold text-muted">
              {de.upload.selectedPages}
            </h2>
            <ul className="flex flex-col gap-2">
              {selected.map((item, index) => (
                <li
                  key={`${item.file.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl bg-surface p-3 card-elevated"
                >
                  {item.previewUrl ? (
                    <Image
                      src={item.previewUrl}
                      alt={`Seite ${index + 1}`}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-accent-strong">
                      PDF
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {hasPdf ? item.file.name : `Seite ${index + 1}`}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatFileSize(item.file.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={de.upload.removePage}
                    className="rounded-lg p-2 text-muted transition hover:bg-black/5 hover:text-foreground"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            {!hasPdf && (
              <button
                type="button"
                disabled={converting}
                onClick={() => fileInput.current?.click()}
                className="mt-3 text-sm font-medium text-accent hover:underline"
              >
                + {converting ? de.upload.converting : de.upload.addMorePages}
              </button>
            )}
          </section>

          <div>
            <label htmlFor="title" className={labelClass}>
              {de.upload.titleLabel}
            </label>
            <input
              id="title"
              type="text"
              value={title}
              placeholder={de.upload.titlePlaceholder}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={uploading || converting}
            className={buttonPrimaryClass}
          >
            {uploading ? de.upload.uploading : de.upload.submit}
          </button>
        </>
      )}
    </form>
  );
}
