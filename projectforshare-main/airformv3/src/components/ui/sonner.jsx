import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-right"
      style={{ fontFamily: "inherit", overflowWrap: "anywhere" }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "bg-main text-main-foreground border-border border-2 font-heading shadow-shadow rounded-base text-sm flex items-center gap-3 p-4 w-[380px] [&:has(button)]:justify-between hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200",
          description: "font-base text-main-foreground/80 text-xs mt-1",
          actionButton:
            "font-base border-2 text-xs h-7 px-3 bg-accent text-accent-foreground border-border rounded-base shrink-0 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200",
          cancelButton:
            "font-base border-2 text-xs h-7 px-3 bg-secondary-background text-main-foreground border-border rounded-base shrink-0 hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200",
          error: "bg-red-500 text-white border-red-600",
          success: "bg-green-500 text-white border-green-600",
          warning: "bg-yellow-500 text-black border-yellow-600",
          loading:
            "[&[data-sonner-toast]_[data-icon]]:flex [&[data-sonner-toast]_[data-icon]]:size-4 [&[data-sonner-toast]_[data-icon]]:relative [&[data-sonner-toast]_[data-icon]]:justify-start [&[data-sonner-toast]_[data-icon]]:items-center [&[data-sonner-toast]_[data-icon]]:flex-shrink-0",
        },
      }}
      {...props} />
  );
}

export { Toaster }
