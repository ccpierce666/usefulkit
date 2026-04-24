export const homeKeywordClusters = [
  "free online tools",
  "online calculator tools",
  "file converter tools",
  "copy and paste tools",
  "privacy friendly online tools",
  "free browser tools",
];

export const categoryKeywordClusters = {
  "file-tools": [
    "image tools online",
    "pdf tools online",
    "file converter online",
    "free image editor tools",
    "browser based file tools",
  ],
  "text-tools": [
    "copy and paste tools",
    "text utility tools",
    "emoji copy and paste",
    "online text formatter",
    "free text tools online",
  ],
  "date-time": [
    "date calculator online",
    "time zone tools",
    "days calculator",
    "meeting planner online",
    "calendar math tools",
  ],
  converters: [
    "free online calculators",
    "paycheck calculator",
    "time card calculator",
    "sales tax calculator",
    "unit converter online",
  ],
  health: [
    "health calculators online",
    "bmi calculator",
    "tdee calculator",
    "water intake calculator",
    "wellness calculators",
  ],
} as const;

export const toolKeywordClusters: Partial<Record<string, string[]>> = {
  "emoji-catalog": [
    "emoji copy and paste",
    "emojis copy and paste",
    "emoji keyboard",
    "emoji meanings",
    "heart emoji copy and paste",
    "text emojis",
  ],
  "pdf-to-jpg": [
    "convert pdf to jpg",
    "pdf to jpeg",
    "extract images from pdf",
    "pdf page to jpg",
    "online pdf to jpg converter",
  ],
  "jpg-to-pdf": [
    "jpg to pdf",
    "images to pdf",
    "photo to pdf",
    "convert image to pdf",
    "jpg to pdf online free",
  ],
  "compress-pdf": [
    "compress pdf online",
    "reduce pdf size",
    "pdf size reducer",
    "make pdf smaller",
    "shrink pdf file",
  ],
  "split-pdf": [
    "split pdf",
    "extract pages from pdf",
    "separate pdf pages",
    "pdf page extractor",
    "split pdf online",
  ],
  "rotate-pdf": [
    "rotate pdf",
    "turn pdf pages",
    "rotate pdf pages online",
    "fix sideways pdf",
    "change pdf orientation",
  ],
  "delete-pdf-pages": [
    "delete pdf pages",
    "remove pages from pdf",
    "delete pages from pdf online",
    "trim pdf pages",
    "remove pdf pages",
  ],
  "pdf-to-text": [
    "pdf to text",
    "extract text from pdf",
    "convert pdf to text",
    "copy text from pdf",
    "pdf text extractor",
  ],
  "add-watermark-pdf": [
    "watermark pdf",
    "add watermark to pdf",
    "pdf watermark online",
    "text watermark pdf",
    "stamp pdf with watermark",
  ],
  "paycheck-calculator": [
    "take home pay calculator",
    "take home income calculator",
    "paycheck tax calculator",
    "salary paycheck calculator",
    "hourly paycheck calculator",
  ],
  "time-card-calculator": [
    "time sheet calculator",
    "work hours calculator",
    "hours worked calculator",
    "payroll time calculator",
    "employee time card calculator",
  ],
  "old-photo-restoration": [
    "restore old photos",
    "ai old photo restoration",
    "repair damaged photos",
    "restore faded photos",
    "old photo restorer",
  ],
  "periodic-table": [
    "interactive periodic table",
    "periodic table with atomic number",
    "element search by symbol",
    "periodic table element lookup",
    "periodic table groups and periods",
  ],
  "qr-code-generator": [
    "qr code maker",
    "qr code creator free",
    "generate qr code from url",
    "qr code for website",
    "free qr code generator",
  ],
  "image-compressor": [
    "reduce image size",
    "compress jpg online",
    "compress png online",
    "photo compressor online",
    "image size reducer",
  ],
  "image-resizer": [
    "resize image online",
    "resize jpg online",
    "resize png online",
    "image resizer for social media",
    "photo resizer online",
  ],
  "merge-pdf": [
    "combine pdf files",
    "join pdf files online",
    "merge pdf files free",
    "pdf combiner online",
    "merge multiple pdfs",
  ],
  "excel-to-pdf": [
    "convert excel to pdf",
    "xlsx to pdf converter",
    "csv to pdf online",
    "spreadsheet to pdf",
    "excel sheet to pdf",
  ],
  "png-to-jpg": [
    "convert png to jpg",
    "png to jpeg",
    "change png to jpg",
    "png image converter",
    "png to jpg online free",
  ],
  "jpg-to-png": [
    "convert jpg to png",
    "jpeg to png converter",
    "change jpg to png",
    "jpg to png online free",
    "image converter jpg to png",
  ],
  "company-lookup-navigator": [
    "company lookup by name",
    "business lookup tool",
    "company registry search",
    "find company information online",
    "business entity search links",
  ],
};

export const toolSeoDescriptionOverrides: Partial<Record<string, string>> = {
  "emoji-catalog":
    "Emoji copy and paste catalog with keyword search for hearts, smileys, flags, and text emojis.",
  "pdf-to-jpg":
    "Convert PDF to JPG or JPEG online, export every page, and handle image extraction in your browser.",
  "jpg-to-pdf":
    "Convert JPG to PDF online, combine multiple images, and create a clean document for printing, sharing, or upload.",
  "compress-pdf":
    "Compress PDF online, reduce PDF file size, and make large documents easier to upload and share.",
  "split-pdf":
    "Split PDF online, extract specific pages, and save only the pages you need in a new document.",
  "rotate-pdf":
    "Rotate PDF online, fix sideways pages, and download a corrected document without desktop software.",
  "delete-pdf-pages":
    "Delete PDF pages online, remove unwanted sheets, and download a cleaner document in your browser.",
  "pdf-to-text":
    "Convert PDF to text online, extract readable text, and copy or download the result in your browser.",
  "add-watermark-pdf":
    "Add watermark to PDF online, stamp every page with text, and download the marked file in your browser.",
  "paycheck-calculator":
    "Estimate take-home pay with salary or hourly inputs, paycheck tax assumptions, and instant net pay results.",
  "time-card-calculator":
    "Track work hours, breaks, overtime, and payroll-ready totals with an easy weekly time card calculator.",
  "old-photo-restoration":
    "Restore old photos online, repair faded pictures, and improve scratched or damaged family photos in browser.",
  "periodic-table":
    "Interactive periodic table with atomic number lookup, symbol search, group filters, and quick element details.",
  "qr-code-generator":
    "Free QR code generator to create QR codes from URLs or text with customizable size, color, and download options.",
  "image-compressor":
    "Reduce image size online with a fast JPG, PNG, and WebP image compressor built for browser workflows.",
  "image-resizer":
    "Resize images online for social media, websites, and documents with custom dimensions and quick presets.",
};
