import { Download, Upload } from "lucide-react";

interface BackupToolsProps {
  onExport: () => string;
  onImport: (json: string) => void;
}

export function BackupTools({ onExport, onImport }: BackupToolsProps) {
  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anime-collection-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      onImport(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleExport}
        className="btn-ghost text-xs"
      >
        <Download className="h-3.5 w-3.5" />
        导出备份
      </button>
      <label className="btn-ghost cursor-pointer text-xs">
        <Upload className="h-3.5 w-3.5" />
        导入备份
        <input
          type="file"
          accept="application/json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}
