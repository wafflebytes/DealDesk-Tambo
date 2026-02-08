"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { Markdown } from "tiptap-markdown"
import { useTamboContextHelpers } from "@tambo-ai/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { Bookmark, Trash2 } from "lucide-react"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

const originalContent = `# MASTER SERVICES AGREEMENT

This Master Services Agreement (**"Agreement"**) is entered into as of the **Effective Date** by and between:

**PARTY A:** Acme Corporation, a Delaware corporation
**PARTY B:** TechVentures LLC, a California limited liability company

---

## 1. DEFINITIONS

1.1 **"Services"** means the consulting and advisory services described in each Statement of Work.
1.2 **"Deliverables"** means all work product created under this Agreement.
1.3 **"Confidential Information"** includes all non-public information.

## 2. TERM AND TERMINATION

2.1 This Agreement shall commence on the **Effective Date** and continue for a period of **twelve (12)** months.
2.2 Either party may terminate with **thirty (30)** days written notice.

## 3. COMPENSATION

3.1 Client shall pay Service Provider at the rates specified in each Statement of Work.
3.2 Payment terms: **Net 30** from invoice date.

## 4. LIABILITY

4.1 **LIMITATION OF LIABILITY:** Liability cap shall not exceed **$50,000** regardless of the form of action, whether in contract, tort, negligence, strict liability or otherwise.
4.2 Neither party shall be liable for indirect, incidental, special, consequential, or punitive damages.

## 5. INTELLECTUAL PROPERTY

5.1 Pre-existing IP remains with the original owner.
5.2 Work product IP transfers upon full payment.

## 6. CONFIDENTIALITY

6.1 Each party agrees to maintain confidentiality of the other party's Confidential Information for a period of **five (5)** years.

## 7. GOVERNING LAW

7.1 This Agreement shall be governed by the laws of the **State of Delaware**, without regard to conflict of law principles.

---

[Signature blocks to follow]`

const redlinedContent = `# MASTER SERVICES AGREEMENT

This Master Services Agreement (**"Agreement"**) is entered into as of the **Effective Date** by and between:

---

## 2. TERM AND TERMINATION
2.1 This Agreement shall commence on the Effective Date and continue for a period of <del>twelve (12)</del> <ins>twenty-four (24)</ins> months.
2.2 Either party may terminate with <del>thirty (30)</del> <ins>sixty (60)</ins> days written notice.

## 3. COMPENSATION
3.1 Client shall pay Service Provider at the rates specified in each Statement of Work.
3.2 Payment terms: Net <del>30</del> <ins>45</ins> from invoice date.

## 4. LIABILITY
4.1 LIMITATION OF LIABILITY: Liability cap shall not exceed <del>$50,000</del> <ins>$250,000</ins>
regardless of the form of action, whether in contract, tort, negligence, strict liability or otherwise.
4.2 Neither party shall be liable for indirect, incidental, special, consequential, or punitive damages.

## 7. GOVERNING LAW
7.1 This Agreement shall be governed by the laws of the State of <del>Delaware</del> <ins>California</ins>, without regard to conflict of law principles.`

interface DocumentEditorProps {
  content?: string
  fileName?: string
}

export function DocumentEditor({ content, fileName }: DocumentEditorProps) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [zoom, setZoom] = useState(100)
  const [diffMode, setDiffMode] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([15]) // Placeholder line number
  const toolbarRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor prose prose-stone max-w-none focus:outline-none",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Markdown,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: diffMode ? redlinedContent : (content || originalContent),
  })

  // Update editor content when props or diffMode changes
  useEffect(() => {
    if (editor) {
      const newContent = diffMode ? redlinedContent : (content || originalContent)
      editor.commands.setContent(newContent)
    }
  }, [content, editor, diffMode])

  // --- Tambo Context Integration ---
  const { addContextHelper, removeContextHelper } = useTamboContextHelpers()

  useEffect(() => {
    if (!editor) return

    // Register a dynamic context helper that runs on every message
    addContextHelper("active_document", () => {
      if (editor.isDestroyed) return {}

      const selection = editor.state.selection
      const selectedText = selection.empty
        ? ""
        : editor.state.doc.textBetween(selection.from, selection.to, " ")

      return {
        content: editor.getText(), // Full text content
        selectedText: selectedText, // User's highlighted text
        cursorPosition: selection.from,
        lineCount: editor.state.doc.childCount
      }
    })

    return () => {
      removeContextHelper("active_document")
    }
  }, [editor, addContextHelper, removeContextHelper])


  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }, [])

  const toggleBookmark = (lineIndex: number) => {
    setBookmarks(prev =>
      prev.includes(lineIndex)
        ? prev.filter(i => i !== lineIndex)
        : [...prev, lineIndex].sort((a, b) => a - b)
    )
  }

  // Estimated line count based on text content
  const lineCount = editor?.getText().split('\n').length || 1

  return (
    <div className="flex flex-col h-full bg-[#FDFCF8] relative overflow-hidden">
      <EditorContext.Provider value={{ editor }}>
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden pt-3 pb-6 flex justify-center px-3 sm:pt-4 sm:pb-8 sm:px-6">
          <div className="relative flex flex-col max-w-4xl w-full bg-white rounded-lg shadow-sm ring-1 ring-stone-200/50 h-full overflow-hidden sm:rounded-xl">

            {/* In-Editor Rich Text Toolbar (Tiptap Style) */}
            {!diffMode && (
              <Toolbar className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-3 h-12 shrink-0 w-full sm:px-6">
                <ToolbarGroup>
                  <UndoRedoButton action="undo" />
                  <UndoRedoButton action="redo" />
                </ToolbarGroup>
                <ToolbarSeparator />
                <ToolbarGroup>
                  <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal />
                  <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} portal />
                  <BlockquoteButton />
                  <CodeBlockButton />
                </ToolbarGroup>
                <ToolbarSeparator />
                <ToolbarGroup>
                  <MarkButton type="bold" />
                  <MarkButton type="italic" />
                  <MarkButton type="strike" />
                  <ColorHighlightPopover />
                  <LinkPopover />
                </ToolbarGroup>
                <ToolbarSeparator />
                <TextAlignButton align="left" />
                <TextAlignButton align="center" />
                <TextAlignButton align="right" />
              </Toolbar>
            )}

            {/* Scrollable Document Area */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Tiptap Integration - Gutter */}
              <div ref={gutterRef} className="w-14 bg-stone-50/80 border-r border-stone-100 flex flex-col pt-12 select-none overflow-hidden shrink-0">
                {Array.from({ length: Math.max(40, lineCount + 10) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => toggleBookmark(i)}
                    className="h-7 w-full flex items-center justify-end pr-4 group/gutter relative outline-none"
                  >
                    <span className={`font-mono text-[10px] transition-colors ${bookmarks.includes(i) ? 'text-amber-500 font-bold' : 'text-stone-300 group-hover:text-stone-400'}`}>
                      {i + 1}
                    </span>
                    {bookmarks.includes(i) && <Bookmark className="absolute top-1/2 -translate-y-1/2 -right-0.5 w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                  </button>
                ))}
              </div>

              {/* Tiptap Integration - Editor Wrapper */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Floating Selection Bubble Menu */}
                {editor && (
                  <BubbleMenu
                    editor={editor}
                    updateDelay={100}
                    className="flex items-center gap-1 p-1 rounded-xl card-skeu shadow-xl border border-stone-200/50 bg-white/95 backdrop-blur-sm overflow-hidden"
                  >
                    <MarkButton type="bold" />
                    <MarkButton type="italic" />
                    <MarkButton type="strike" />
                    <ToolbarSeparator />
                    <LinkPopover />
                  </BubbleMenu>
                )}

                <div
                  className="flex-1 p-12 overflow-auto transition-all duration-300 scroll-smooth"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  onScroll={handleScroll}
                >
                  <EditorContent
                    editor={editor}
                    className="min-h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </EditorContext.Provider>
    </div>
  )
}
