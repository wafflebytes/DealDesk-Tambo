"use client"

import { useState, useRef } from "react"
import { FileText, Download, MoreHorizontal, GitCompare, Bookmark, ZoomIn, ZoomOut, Check, ChevronDown, Trash2 } from "lucide-react"


const originalContent = `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of 
the Effective Date by and between:

PARTY A: Acme Corporation, a Delaware corporation
PARTY B: TechVentures LLC, a California limited liability company

1. DEFINITIONS
   1.1 "Services" means the consulting and advisory services 
       described in each Statement of Work.
   1.2 "Deliverables" means all work product created under this Agreement.
   1.3 "Confidential Information" includes all non-public information.

2. TERM AND TERMINATION
   2.1 This Agreement shall commence on the Effective Date and 
       continue for a period of twelve (12) months.
   2.2 Either party may terminate with thirty (30) days written notice.

3. COMPENSATION
   3.1 Client shall pay Service Provider at the rates specified 
       in each Statement of Work.
   3.2 Payment terms: Net 30 from invoice date.

4. LIABILITY
   4.1 LIMITATION OF LIABILITY: Liability cap shall not exceed $50,000
       regardless of the form of action, whether in contract, tort,
       negligence, strict liability or otherwise.
   4.2 Neither party shall be liable for indirect, incidental,
       special, consequential, or punitive damages.

5. INTELLECTUAL PROPERTY
   5.1 Pre-existing IP remains with the original owner.
   5.2 Work product IP transfers upon full payment.

6. CONFIDENTIALITY
   6.1 Each party agrees to maintain confidentiality of the other
       party's Confidential Information for a period of five (5) years.

7. GOVERNING LAW
   7.1 This Agreement shall be governed by the laws of the State
       of Delaware, without regard to conflict of law principles.

[Signature blocks to follow]`

// Mock diff content - in a real app this would come from a diff engine
const redlinedContent = `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of 
the Effective Date by and between:

PARTY A: Acme Corporation, a Delaware corporation
PARTY B: TechVentures LLC, a California limited liability company

1. DEFINITIONS
   1.1 "Services" means the consulting and advisory services 
       described in each Statement of Work.
   1.2 "Deliverables" means all work product created under this Agreement.
   1.3 "Confidential Information" includes all non-public information.

2. TERM AND TERMINATION
   2.1 This Agreement shall commence on the Effective Date and 
       continue for a period of <del>twelve (12)</del> <ins>twenty-four (24)</ins> months.
   2.2 Either party may terminate with <del>thirty (30)</del> <ins>sixty (60)</ins> days written notice.

3. COMPENSATION
   3.1 Client shall pay Service Provider at the rates specified 
       in each Statement of Work.
   3.2 Payment terms: Net <del>30</del> <ins>45</ins> from invoice date.

4. LIABILITY
   4.1 LIMITATION OF LIABILITY: Liability cap shall not exceed <del>$50,000</del> <ins>$250,000</ins>
       regardless of the form of action, whether in contract, tort,
       negligence, strict liability or otherwise.
   4.2 Neither party shall be liable for indirect, incidental,
       special, consequential, or punitive damages.

5. INTELLECTUAL PROPERTY
   5.1 Pre-existing IP remains with the original owner.
   5.2 Work product IP transfers upon full payment.

6. CONFIDENTIALITY
   6.1 Each party agrees to maintain confidentiality of the other
       party's Confidential Information for a period of <del>five (5)</del> <ins>three (3)</ins> years.

7. GOVERNING LAW
   7.1 This Agreement shall be governed by the laws of the State
       of <del>Delaware</del> <ins>California</ins>, without regard to conflict of law principles.

[Signature blocks to follow]`

export function DocumentEditor() {
  const [diffMode, setDiffMode] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [bookmarks, setBookmarks] = useState<number[]>([30]) // Initial bookmark on Liability section
  const [showBookmarks, setShowBookmarks] = useState(false)

  const contentToRender = diffMode ? redlinedContent : originalContent
  const lines = contentToRender.split('\n')

  const toggleBookmark = (lineIndex: number) => {
    setBookmarks(prev =>
      prev.includes(lineIndex)
        ? prev.filter(i => i !== lineIndex)
        : [...prev, lineIndex].sort((a, b) => a - b)
    )
  }

  const scrollToLine = (lineIndex: number) => {
    const element = document.getElementById(`line-${lineIndex}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Highlight effect
      element.classList.add('bg-amber-100/50')
      setTimeout(() => element.classList.remove('bg-amber-100/50'), 2000)
    }
    setShowBookmarks(false)
  }

  const handleDownload = () => {
    // Native print allows us to keep text selectable
    // See globals.css @media print for the styling magic
    window.print()
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#FDFCF8] to-stone-100/50 relative">
      {/* Floating Pill Toolbar - Skeuomorphic */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pdf-hide">
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl card-skeu">
          {/* File indicator */}
          <button className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs text-stone-700 hover:bg-stone-100/50 transition-colors font-medium">
            <FileText className="w-4 h-4 text-stone-500" />
            <span>MSA_Acme.pdf</span>
          </button>

          <div className="w-px h-5 bg-gradient-to-b from-stone-100 via-stone-300 to-stone-100" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setZoom(Math.max(75, zoom - 10))}
              className="w-7 h-7 rounded-md btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-xs text-stone-500 font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="w-7 h-7 rounded-md btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-gradient-to-b from-stone-100 via-stone-300 to-stone-100" />

          {/* Diff Mode Toggle - Skeuomorphic */}
          <button
            onClick={() => setDiffMode(!diffMode)}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all ${diffMode
              ? 'btn-skeu-dark'
              : 'btn-skeu text-stone-600'
              }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Diff
          </button>

          <div className="w-px h-5 bg-gradient-to-b from-stone-100 via-stone-300 to-stone-100" />

          {/* Bookmarks Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showBookmarks || bookmarks.length > 0 ? 'text-amber-600 bg-amber-50 border border-amber-200 shadow-inner' : 'btn-skeu text-stone-500 hover:text-stone-700'
                }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarks.length > 0 ? 'fill-current' : ''}`} />
            </button>

            {/* Bookmarks Dropdown - Slide from top */}
            {showBookmarks && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden animate-in slide-in-from-top-4 fade-in z-50">
                <div className="px-3 py-2 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Bookmarks</span>
                  <span className="text-[10px] text-stone-400 font-mono">{bookmarks.length} saved</span>
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {bookmarks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400">
                      No bookmarks yet.
                      <br />
                      Click line numbers to pin.
                    </div>
                  ) : (
                    bookmarks.map(lineIdx => (
                      <button
                        key={lineIdx}
                        onClick={() => scrollToLine(lineIdx)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2 group"
                      >
                        <span className="flex-none w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-mono border border-amber-100">
                          {lineIdx + 1}
                        </span>
                        <span className="flex-1 text-xs text-stone-600 truncate font-medium">
                          {lines[lineIdx].replace(/<[^>]+>/g, '').substring(0, 30)}...
                        </span>
                        <Trash2
                          className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(lineIdx)
                          }}
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button className="w-8 h-8 rounded-lg btn-skeu flex items-center justify-center text-stone-500 hover:text-stone-700">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body - Paper texture */}
      <div className="flex-1 overflow-auto pt-20 pb-8">
        <div
          id="printable-document"
          className="max-w-2xl mx-auto px-10 py-10 bg-white rounded-lg card-skeu"
          style={{ fontSize: `${zoom}%` }}
        >
          {lines.map((line, index) => {
            // Enhanced Diff Logic for Rendering
            // We need to parse <ins> and <del> tags purely for display if we are in diff mode
            // Since React escapes HTML by default, we'll need a simple parser or dangerouslySetInnerHTML
            // Given the controlled content, dangerouslySetInnerHTML is acceptable here for the diff tags.

            const isBookmarked = bookmarks.includes(index)
            const isTitle = index === 0
            const isSectionHeader = /^[0-9]+\.\s[A-Z]/.test(line.replace(/<[^>]+>/g, '').trim())

            return (
              <div
                key={index}
                id={`line-${index}`}
                className={`flex leading-relaxed group/line transition-colors duration-500 ${isBookmarked ? 'bg-amber-50/30' : ''}`}
              >
                {/* Line Number / Bookmark Toggle */}
                <button
                  onClick={() => toggleBookmark(index)}
                  className="w-10 flex-shrink-0 text-right pr-4 select-none pt-1.5 group/number relative outline-none pdf-hide"
                >
                  <span className={`font-mono text-xs transition-colors ${isBookmarked ? 'text-amber-500 font-bold' : 'text-stone-300 group-hover/line:text-stone-400'}`}>
                    {index + 1}
                  </span>

                  {/* Hover Bookmark Icon */}
                  <div className={`absolute top-1.5 right-0 opacity-0 group-hover/number:opacity-100 transition-opacity ${isBookmarked ? 'opacity-100' : ''}`}>
                    <Bookmark className={`w-3 h-3 ${isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                  </div>
                </button>

                {/* Print Line Number (Text Only) - User requested removal from PDF but we keep structure if needed later, now hidden */}
                <span className="hidden w-8 text-right pr-4 text-stone-300 text-xs select-none pdf-hide">
                  {index + 1}
                </span>

                <span
                  className={`flex-1 whitespace-pre-wrap font-sans ${isTitle
                    ? 'text-xl font-semibold text-stone-900 tracking-tight'
                    : isSectionHeader
                      ? 'font-medium text-stone-800 tracking-tight'
                      : 'text-stone-600 tracking-tight'
                    }`}
                  dangerouslySetInnerHTML={{ __html: line }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Diff Mode Indicator - Skeuomorphic pill - Higher Z-Index */}
      {diffMode && (
        <div className="absolute top-[70px] left-1/2 -translate-x-1/2 z-[100] pdf-hide">
          <div className="px-4 py-2 btn-skeu-dark rounded-full text-xs tracking-tight flex items-center gap-3 shadow-lg">
            <span className="flex items-center gap-1.5 to-stone-300">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-stone-400 line-through">Deleted</span>
            </span>
            <span className="w-px h-3 bg-stone-600" />
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#20808D] animate-pulse" />
              <span className="text-[#20808D] font-medium">Added</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
