import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, FileSpreadsheet, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSOC } from "@/lib/soc-store";

const ACCEPT = ".csv,.pdf,.png,.jpg,.jpeg";

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return FileSpreadsheet;
  if (ext === "pdf") return FileText;
  return ImageIcon;
}

export function FileUpload() {
  const { ingestFile } = useSOC();
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState<{ name: string; progress: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      Array.from(list).forEach((file) => {
        const entry = { name: file.name, progress: 0 };
        setFiles((p) => [...p, entry]);
        const id = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === entry.name
                ? { ...f, progress: Math.min(100, f.progress + 12 + Math.random() * 14) }
                : f,
            ),
          );
        }, 180);
        setTimeout(() => {
          clearInterval(id);
          setFiles((prev) =>
            prev.map((f) => (f.name === entry.name ? { ...f, progress: 100 } : f)),
          );
          ingestFile(file.name);
          setTimeout(
            () => setFiles((prev) => prev.filter((f) => f.name !== entry.name)),
            1400,
          );
        }, 1500);
      });
    },
    [ingestFile],
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all ${
          drag
            ? "border-primary bg-primary/10 glow-ring"
            : "border-border hover:border-primary/60 hover:bg-primary/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-primary/15 p-3 text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">Drop CSV, PDF or image logs</p>
          <p className="text-xs text-muted-foreground">
            Network logs · Reports · Screen captures
          </p>
        </div>
      </div>

      <AnimatePresence>
        {files.map((f) => {
          const Icon = iconFor(f.name);
          return (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="glass flex items-center gap-3 rounded-lg p-3"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium">{f.name}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {Math.round(f.progress)}%
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-background/60">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>
              {f.progress === 100 ? (
                <span className="text-[10px] font-bold text-success">PARSED</span>
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
