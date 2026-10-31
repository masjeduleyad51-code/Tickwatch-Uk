import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, validatePhoto } from "@/schemas/reportSchema";

export function PhotoField({
  file, onChange, error, warning,
}: { file: File | null; onChange: (file: File | null, error: string | null) => void; error: string | null; warning?: string | undefined }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Field
      id="photo"
      label="Photo"
      hint={`JPEG, PNG or WebP, up to ${MAX_PHOTO_BYTES / 1048576} MB. A close-up of the tick next to a coin or ruler helps identification.`}
      error={error ?? undefined}
      warning={warning}
    >
      {(aria) => (
        <div className="space-y-3">
          <input
            ref={input}
            type="file"
            accept={PHOTO_TYPES.join(",")}
            {...aria}
            className="block w-full text-sm file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-md file:border-0 file:bg-secondary file:px-4 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              const err = validatePhoto(f);
              if (err && input.current) input.current.value = "";
              onChange(err ? null : f, err);
            }}
          />
          {file && preview ? (
            <div className="flex items-center gap-3 rounded-lg border p-2">
              <img src={preview} alt={`Preview of ${file.name}`} className="size-20 rounded-md object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => { if (input.current) input.current.value = ""; onChange(null, null); }}>
                <X aria-hidden /> Remove<span className="sr-only"> photo</span>
              </Button>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><ImagePlus className="size-4" aria-hidden /> No photo selected</p>
          )}
        </div>
      )}
    </Field>
  );
}
