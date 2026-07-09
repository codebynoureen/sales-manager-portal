import { cn } from "@/lib/utils";

const fieldBase =
  "h-10 w-full rounded-sm border-[1.5px] border-border bg-surface2 px-3 text-base text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-3 focus:ring-primary/10";

export function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-dim">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {hint && <span className="text-sm text-text-muted">{hint}</span>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(fieldBase, "cursor-pointer", className)}>
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldBase, "h-20 resize-y py-2", props.className)} />;
}
