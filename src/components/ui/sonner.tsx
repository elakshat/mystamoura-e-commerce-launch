import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      mobileOffset={{ bottom: "calc(5rem + env(safe-area-inset-bottom))", left: 16, right: 16 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-none group-[.toaster]:border-0 group-[.toaster]:bg-[hsl(var(--nuit))] group-[.toaster]:text-[hsl(var(--nuit-foreground))] group-[.toaster]:font-sans group-[.toaster]:shadow-[0_20px_50px_-15px_hsl(24_20%_10%/0.5)]",
          title: "group-[.toast]:text-[13px] group-[.toast]:font-normal group-[.toast]:tracking-wide",
          description: "group-[.toast]:text-[hsl(var(--nuit-muted))]",
          icon: "group-[.toast]:text-[hsl(var(--brass-light))]",
          actionButton: "group-[.toast]:rounded-none group-[.toast]:bg-[hsl(var(--nuit-foreground))] group-[.toast]:text-[hsl(var(--nuit))] group-[.toast]:uppercase group-[.toast]:tracking-[0.14em] group-[.toast]:text-[10px]",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
      theme="light"
    />
  );
};

export { Toaster, toast };
