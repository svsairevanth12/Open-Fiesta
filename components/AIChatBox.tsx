"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Paperclip, Send, Loader2, X, FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

const AnimatedPlaceholder = ({ showSearch }: { showSearch: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
      className="pointer-events-none w-[150px] text-sm absolute text-black/30 dark:text-white/30 sm:text-black/70 sm:dark:text-white/70 drop-shadow-sm"
    >
      {showSearch ? "Search the web..." : "Ask Anything..."}
    </motion.p>
  </AnimatePresence>
)

export function AiInput({ onSubmit, loading = false }: { onSubmit: (text: string, imageDataUrl?: string, webSearch?: boolean) => void; loading?: boolean }) {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })
  const [showSearch, setShowSearch] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [barVisible, setBarVisible] = useState(true)
  const lastScrollY = useRef(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handelClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" 
    }
    setImagePreview(null)
    setAttachedFile(null)
  }

  const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (!file) return

    // Allowed types: images + text/plain + pdf + msword + docx
    const allowed = [
      /^image\//,
      /^text\/plain$/,
      /^application\/pdf$/,
      /^application\/msword$/,
      /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/,
    ]
    const isAllowed = allowed.some((re) => re.test(file.type))
    if (!isAllowed) {
      setErrorMsg("Unsupported file. Allowed: Images, TXT, PDF, DOC, DOCX.")
      setTimeout(() => setErrorMsg(null), 4000) 
      if (fileInputRef.current) fileInputRef.current.value = "" // reset so same file can be selected later
      return
    }

    setAttachedFile(file)
    if (file.type.startsWith("image/")) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async () => {
    let dataUrl: string | undefined
    if (attachedFile) {
      dataUrl = await new Promise<string>((resolve) => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result))
        fr.readAsDataURL(attachedFile)
      })
    }
    onSubmit(value.trim(), dataUrl, showSearch)
    setValue("")
    setAttachedFile(null)
    setImagePreview(null)
    adjustHeight(true)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Hide bar on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      const delta = y - lastScrollY.current
      const threshold = 6 
      if (y < 8) {
        setBarVisible(true)
      } else if (delta > threshold) {
        setBarVisible(false)
      } else if (delta < -threshold) {
        setBarVisible(true)
      }
      lastScrollY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <motion.div
      className="w-full py-4"
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: barVisible ? 0 : 72, opacity: barVisible ? 1 : 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative max-w-xl border rounded-[22px] border-black/5 p-1 w-full mx-auto backdrop-blur-sm">
        <div className="relative rounded-2xl border border-black/5 bg-neutral-800/5 flex flex-col backdrop-blur-sm">
          <div className="overflow-y-auto" style={{ maxHeight: `${MAX_HEIGHT}px` }}>
            {imagePreview ? (
              <div className="grid grid-cols-[96px_1fr] gap-3 p-3 pr-4">
                <div className="relative h-[96px] w-[96px] rounded-xl overflow-hidden border border-white/10 shadow-sm">
                  <Image
                    className="object-cover h-full w-full"
                    src={imagePreview}
                    height={240}
                    width={240}
                    alt="attached image"
                  />
                  <button
                    onClick={handelClose}
                    className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-black/70 text-white hover:bg-black/80 border border-white/20"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="relative rounded-xl bg-black/45 dark:bg-white/10 border border-white/10 backdrop-blur-sm">
                  <Textarea
                    id="ai-input-04"
                    value={value}
                    placeholder=""
                    className="w-full rounded-xl px-4 py-3 bg-transparent border-none text-white resize-none focus-visible:ring-0 leading-[1.2]"
                    ref={textareaRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    onChange={(e) => {
                      setValue(e.target.value)
                      adjustHeight()
                    }}
                  />
                  {!value && (
                    <div className="absolute left-4 top-3">
                      <AnimatedPlaceholder showSearch={showSearch} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative backdrop-blur-sm">
                <Textarea
                  id="ai-input-04"
                  value={value}
                  placeholder=""
                  className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-black/45 dark:bg-white/10 border-none text-white resize-none focus-visible:ring-0 leading-[1.2]"
                  ref={textareaRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  onChange={(e) => {
                    setValue(e.target.value)
                    adjustHeight()
                  }}
                />
                {!value && (
                  <div className="absolute left-4 top-3">
                    <AnimatedPlaceholder showSearch={showSearch} />
                  </div>
                )}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="px-4 py-2 text-[13px] text-rose-200 bg-rose-500/10 border-t border-white/10">
              {errorMsg}
            </div>
          )}

          {attachedFile && !imagePreview && (
            <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-white/80" />
                <span className="truncate text-sm text-white/90" title={attachedFile.name}>{attachedFile.name}</span>
                <span className="text-xs text-white/60 flex-shrink-0">{Math.max(1, Math.round(attachedFile.size / 1024))} KB</span>
              </div>
              <button
                onClick={handelClose}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-black/50 text-white/90 hover:bg-black/60 border border-white/10"
                aria-label="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="h-12 bg-black/30 dark:bg-white/10 rounded-b-xl backdrop-blur-sm">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <label
                className={cn(
                  "cursor-pointer relative rounded-full p-2 bg-black/30 dark:bg-white/10",
                  attachedFile
                    ? "bg-[#ff3f17]/15 border border-[#ff3f17] text-[#ff3f17]"
                    : "text-white/60 hover:text-white"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handelChange}
                  accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                />
                <Paperclip
                  className={cn("w-4 h-4 transition-colors", attachedFile ? "text-[#ff3f17]" : "text-white/60 hover:text-white")}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch)
                }}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                  showSearch
                    ? "bg-[#ff3f17]/15 border-[#ff3f17] text-[#ff3f17]"
                    : "bg-black/30 dark:bg-white/10 border-transparent text-white/80 hover:text-white"
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "w-4 h-4",
                        showSearch ? "text-[#ff3f17]" : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm overflow-hidden whitespace-nowrap text-[#ff3f17] flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  loading
                    ? "bg-[#e42a42]/20 text-[#e42a42] cursor-not-allowed"
                  : value
                    ? "bg-[#ff3f17]/15 text-[#ff3f17]"
                    : "bg-black/30 dark:bg-white/10 text-white/85 hover:text-white"
                )}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
