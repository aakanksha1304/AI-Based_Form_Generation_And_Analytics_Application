import * as React from "react"
import { cn } from "@/lib/utils"

const ImageCard = React.forwardRef(({ className, imageUrl, caption, onClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-base border-2 border-border bg-main shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={caption}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-main/90 border-t-2 border-border p-2">
          <p className="text-sm font-base text-main-foreground truncate">
            {caption}
          </p>
        </div>
      )}
    </div>
  )
})
ImageCard.displayName = "ImageCard"

export default ImageCard