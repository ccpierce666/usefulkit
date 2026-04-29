import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { toolKeywordClusters, toolSeoDescriptionOverrides } from "@/lib/seo-keywords";
import { AgeCalculatorTool } from "@/components/age-calculator-tool";
import { AddWatermarkPdfTool } from "@/components/add-watermark-pdf-tool";
import { AprCalculatorTool } from "@/components/apr-calculator-tool";
import { BmiCalculatorTool } from "@/components/bmi-calculator-tool";
import { CaseConverterTool } from "@/components/case-converter-tool";
import { CharacterCounterTool } from "@/components/character-counter-tool";
import { CompanyLookupNavigatorTool } from "@/components/company-lookup-navigator-tool";
import { CurrencyConverterTool } from "@/components/currency-converter-tool";
import { DaysFromTodayTool } from "@/components/days-from-today-tool";
import { DaysBetweenDatesTool } from "@/components/days-between-dates-tool";
import { DeletePdfPagesTool } from "@/components/delete-pdf-pages-tool";
import { DiscountTaxCalculatorTool } from "@/components/discount-tax-calculator-tool";
import { CompressPdfTool } from "@/components/compress-pdf-tool";
import { EmojiCatalogTool } from "@/components/emoji-catalog-tool";
import { ExcelToPdfTool } from "@/components/excel-to-pdf-tool";
import { EvChargingCostCalculatorTool } from "@/components/ev-charging-cost-calculator-tool";
import { EvTripChargingCostPlannerTool } from "@/components/ev-trip-charging-cost-planner-tool";
import { GifCompressorTool } from "@/components/gif-compressor-tool";
import { GifToMp4Tool } from "@/components/gif-to-mp4-tool";
import { HairstyleTryOnTool } from "@/components/hairstyle-try-on-tool";
import { HeicToJpgTool } from "@/components/heic-to-jpg-tool";
import { IbBuyingPowerSimulatorTool } from "@/components/ib-buying-power-simulator-tool";
import { IdListFormatterTool } from "@/components/id-list-formatter-tool";
import { ImageCompressorTool } from "@/components/image-compressor-tool";
import { ImageConverterTool } from "@/components/image-converter-tool";
import { ImageMosaicTool } from "@/components/image-mosaic-tool";
import { ImageResizerTool } from "@/components/image-resizer-tool";
import { JpgToPdfTool } from "@/components/jpg-to-pdf-tool";
import { JpgToPngTool } from "@/components/jpg-to-png-tool";
import { LoanPaymentCalculatorTool } from "@/components/loan-payment-calculator-tool";
import { Md5Tool } from "@/components/md5-tool";
import { MarkupMarginCalculatorTool } from "@/components/markup-margin-calculator-tool";
import { MergePdfTool } from "@/components/merge-pdf-tool";
import { Mp4ToGifTool } from "@/components/mp4-to-gif-tool";
import { OldPhotoRestorationTool } from "@/components/old-photo-restoration-tool";
import { PercentageCalculatorTool } from "@/components/percentage-calculator-tool";
import { PaycheckCalculatorTool } from "@/components/paycheck-calculator-tool";
import { PeriodicTableTool } from "@/components/periodic-table-tool";
import { PdfToJpgTool } from "@/components/pdf-to-jpg-tool";
import { PdfSummarizerTool } from "@/components/pdf-summarizer-tool";
import { PdfToTextTool } from "@/components/pdf-to-text-tool";
import { PngToJpgTool } from "@/components/png-to-jpg-tool";
import { QuarterlyTaxSafePayPlannerTool } from "@/components/quarterly-tax-safe-pay-planner-tool";
import { QrCodeGeneratorTool } from "@/components/qr-code-generator-tool";
import { RobloxPlayerLookupTool } from "@/components/roblox-player-lookup-tool";
import { RemoveBackgroundTool } from "@/components/remove-background-tool";
import { RemoveLineBreaksTool } from "@/components/remove-line-breaks-tool";
import { RotatePdfTool } from "@/components/rotate-pdf-tool";
import { SalesTaxCalculatorTool } from "@/components/sales-tax-calculator-tool";
import { SubscriptionDowngradeOptimizerTool } from "@/components/subscription-downgrade-optimizer-tool";
import { SubscriptionWasteFinderTool } from "@/components/subscription-waste-finder-tool";
import { SplitPdfTool } from "@/components/split-pdf-tool";
import { TdeeCalculatorTool } from "@/components/tdee-calculator-tool";
import { TimeCardCalculatorTool } from "@/components/time-card-calculator-tool";
import { TimeZoneMeetingPlannerTool } from "@/components/time-zone-meeting-planner-tool";
import { TipCalculatorTool } from "@/components/tip-calculator-tool";
import { UnitConverterTool } from "@/components/unit-converter-tool";
import { WaterIntakeCalculatorTool } from "@/components/water-intake-calculator-tool";
import { WebpToJpgTool } from "@/components/webp-to-jpg-tool";
import { WordCounterTool } from "@/components/word-counter-tool";
import { categoryLabels, getToolBySlug, getToolsByCategory, tools, type ToolItem } from "@/lib/tools";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return {};
  }

  const categoryName = categoryLabels[tool.category];
  const keywordCluster = toolKeywordClusters[tool.slug] ?? [];
  const seoDescription =
    toolSeoDescriptionOverrides[tool.slug] ??
    `${tool.summary} Free online ${tool.name.toLowerCase()} with instant results.`;
  const keywords = [
    tool.keyword,
    tool.name.toLowerCase(),
    `${tool.name.toLowerCase()} online`,
    `free ${tool.keyword}`,
    `${categoryName.toLowerCase()} tool`,
    "usefulkit",
    ...keywordCluster,
  ];

  return {
    title: `${tool.name} - Free Online`,
    description: seoDescription,
    keywords,
    alternates: {
      canonical: `https://usefulkit.io/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} | UsefulKit`,
      description: seoDescription,
      url: `https://usefulkit.io/tools/${tool.slug}`,
      siteName: "UsefulKit",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | UsefulKit`,
      description: seoDescription,
    },
  };
}

type FaqItem = {
  question: string;
  answer: string;
};

type GuideSection = {
  title: string;
  content: string;
};

const categoryTips: Record<ToolItem["category"], string> = {
  "file-tools":
    "For file tools, start with a small sample file first, confirm output quality, then process larger files. This helps avoid repeated work and makes your workflow more predictable.",
  "text-tools":
    "For text tools, paste a representative input sample and validate formatting before batch use. Small preview checks can prevent downstream issues in SQL, scripts, documents, and publishing workflows.",
  "date-time":
    "For date and time tools, verify timezone and boundary assumptions up front. A quick check on start/end rules helps prevent subtle scheduling and reporting mistakes.",
  converters:
    "For converter tools, always double-check units and rounding expectations. Consistent input assumptions make financial and measurement outputs easier to trust and compare.",
  health:
    "For health tools, use them as quick estimates and trend references. For medical decisions, always validate with professional guidance and your local standards.",
};

function buildUsageGuide(tool: ToolItem, categoryName: string): GuideSection[] {
  const slugLogic: Partial<Record<ToolItem["slug"], string>> = {
    "paycheck-calculator":
      "The calculator derives paycheck gross income from salary/hourly mode and pay frequency, then applies pre-tax deductions and tax assumptions (federal/state/local/FICA) to estimate take-home pay.",
    "time-card-calculator":
      "Daily worked time is computed from clock-out minus clock-in minus break minutes, then aggregated weekly. Hours above your configured threshold are classified as overtime and priced with the overtime multiplier.",
    "loan-payment-calculator":
      "Monthly payment follows fixed-rate amortization assumptions. Total interest and repayment are derived from principal, periodic rate, and term length.",
    "percentage-calculator":
      "Outputs are deterministic percentage transformations: part-of-whole, rate derivation, and increase/decrease scenarios based on the selected mode.",
    "days-from-today":
      "Calendar mode applies direct day offsets; business mode advances by weekdays only. Boundary behavior changes when 'include start date' is enabled.",
    "qr-code-generator":
      "The QR matrix is encoded from your payload with selected error correction, quiet-zone margin, and render colors, then exported as PNG.",
    "company-lookup-navigator":
      "The tool normalizes your company query and prepares source-specific search URLs, so you can validate legal, commercial, and reputation signals in parallel.",
    "roblox-player-lookup":
      "The tool resolves Roblox username or user ID through public endpoints, then aggregates profile, avatar, and social count data into one view.",
    "ib-buying-power-simulator":
      "The simulator estimates initial and maintenance margin usage from A/B/C stock position values, then projects remaining buying power from your net liquidation value and assumed initial margin rate.",
    "word-counter":
      "The editor tokenizes text into words, characters, lines, and sentence boundaries in real time, then estimates reading time from word count.",
    "character-counter":
      "The tool tracks visible characters, whitespace, and line breaks to support platform-specific text limits and validation.",
    "case-converter":
      "Text is transformed using deterministic casing rules for lower, upper, title, and sentence modes while preserving source punctuation.",
    "remove-line-breaks":
      "The tool normalizes newline characters and replaces them with your selected separator, producing a single clean line for scripts or SQL usage.",
    "id-list-formatter":
      "Each input line is trimmed and merged with your suffix symbol to generate copy-ready IDs for queries, scripts, and batch jobs.",
    "currency-converter":
      "The converter applies selected base rates and directional currency pairs to calculate equivalent values with consistent decimal formatting.",
    "sales-tax-calculator":
      "Add-tax mode computes tax from a pre-tax base, while extract-tax mode reverses the formula from tax-included totals.",
    "discount-tax-calculator":
      "The calculator applies discount first, then computes sales tax on the discounted amount to produce checkout-accurate totals.",
    "tip-calculator":
      "Tip amount is derived from bill subtotal and tip percent, then split logic divides final payable totals across party size.",
    "markup-margin-calculator":
      "The tool solves pricing equations between cost, selling price, markup percent, and margin percent depending on selected input mode.",
    "apr-calculator":
      "APR mode uses loan principal, term, and payment assumptions to estimate annualized borrowing cost under fixed-rate repayment behavior.",
    "unit-converter":
      "Values are converted through category-specific base units so every unit pair in length, weight, temperature, and area remains internally consistent.",
    "tdee-calculator":
      "The tool estimates BMR from body inputs and multiplies by activity factor to project maintenance calories and cut/bulk targets.",
    "water-intake-calculator":
      "Hydration target starts from body-weight baseline, then adjusts for activity duration and heat level before returning cups and liters.",
    "time-zone-converter":
      "The planner translates local work windows across time zones, then computes overlap intervals that satisfy meeting duration constraints.",
    "ev-charging-cost-calculator":
      "The estimator combines state electricity assumptions, vehicle efficiency, and charging mix to project monthly and annual EV fueling cost.",
    "ev-trip-charging-cost-planner":
      "Trip model converts route distance into kWh demand, estimates charging stops from usable battery window, and compares EV versus gas cost.",
    "pdf-summarizer":
      "The summarizer extracts document text, ranks sentence salience, and returns concise key-point output for quick review workflows.",
    "merge-pdf":
      "The merger preserves your file order, appends each document page set in sequence, and exports one combined PDF output.",
    "pdf-to-jpg":
      "Each PDF page is rasterized at configured render scale, then encoded to JPG so pages can be reused as slide or image assets.",
    "png-to-jpg":
      "Transparent PNG pixels are composited onto a chosen background color before JPG encoding to avoid black or undefined alpha output.",
    "jpg-to-png":
      "The tool decodes JPG and re-encodes PNG losslessly, commonly used when workflows require transparency-capable or non-lossy target format.",
    "image-compressor":
      "The image compressor re-encodes source frames with quality and format controls to reduce payload size while preserving usable visual quality.",
    "image-converter":
      "The converter normalizes source pixels on canvas and exports them in selected format, handling alpha behavior differences between JPG and PNG.",
    "image-resizer":
      "Resize mode redraws source image to target dimensions or social presets, balancing output size and aspect behavior for publishing needs.",
    "subscription-waste-finder":
      "The analyzer groups recurring transactions by merchant pattern and billing interval to flag duplicates and potentially unused subscriptions.",
    "subscription-downgrade-optimizer":
      "The optimizer models plan alternatives such as ad tiers, annual billing, and bundle scenarios to estimate potential monthly savings.",
    "quarterly-tax-safe-pay-planner":
      "Planner estimates safe quarterly payment targets from projected income, effective tax assumptions, and withholding offsets across due dates.",
    "compress-pdf":
      "The tool rewrites PDF object streams with optimized save settings to reduce file size for uploads, sharing, and browser-based document workflows.",
    "split-pdf":
      "The tool reads your page ranges, copies only the selected PDF pages, and builds a new downloadable document in the browser.",
    "rotate-pdf":
      "The tool updates page rotation metadata for all pages or selected page ranges, then exports a corrected PDF directly in the browser.",
    "delete-pdf-pages":
      "The tool removes the selected pages from a PDF, keeps the remaining pages in order, and exports a cleaner document in the browser.",
    "pdf-to-text":
      "The tool reads text content from each PDF page, combines it into plain text output, and lets you copy or download the result in the browser.",
    "add-watermark-pdf":
      "The tool draws a configurable text watermark onto every PDF page, then exports the marked document directly in the browser.",
    "jpg-to-pdf":
      "The tool places uploaded images onto PDF pages, preserves the selected order, and exports a multi-page document directly in the browser.",
    "emoji-catalog":
      "The catalog groups emoji by family and applies deterministic keyword matching so users can quickly find and copy symbols for chats, posts, and documents.",
    "excel-to-pdf":
      "Workbook rows are parsed client-side, transformed into tabular layout, and rendered into paginated PDF output with sheet selection and size constraints.",
    "hairstyle-try-on":
      "The tool reads your portrait and applies either provider output or local visual masking to preview selected hairstyle shape and color before making a real haircut decision.",
    "image-mosaic":
      "The image is downscaled into a low-resolution grid and then scaled back up with smoothing disabled, producing block-based mosaic pixels across the full frame.",
    "remove-background":
      "The tool estimates background color from edge regions, computes per-pixel color distance, and applies alpha masking with soft transitions for a transparent output.",
    "webp-to-jpg":
      "The tool decodes WebP in-browser, flattens transparency when needed, then exports JPG or PNG based on your selected compatibility target.",
    "heic-to-jpg":
      "The tool decodes HEIC/HEIF photos in-browser and re-encodes them as JPG so they can be uploaded to platforms that do not support HEIC.",
    "gif-compressor":
      "The tool re-encodes GIF frames with configurable frame rate, scale, and color palette limits to reduce final file size.",
    "gif-to-mp4":
      "The tool transcodes animated GIF into H.264 MP4 with browser-compatible pixel format and faststart flags for web delivery.",
    "mp4-to-gif":
      "The tool extracts a short MP4 segment, generates an optimized palette, and encodes it as a looping GIF.",
    "periodic-table":
      "The tool maps elements by period and group, then supports fast lookup by name, symbol, and atomic number with family-level filtering.",
    "old-photo-restoration":
      "The restoration pipeline denoises grain, boosts contrast, corrects faded tones, and suppresses scratch-like outliers to produce a cleaner digital version of scanned old photos.",
  };

  const logicSentence =
    slugLogic[tool.slug] ??
    "The result is generated from the selected mode and entered values using deterministic rules, so identical inputs always produce identical outputs.";

  const categoryUseCases: Record<ToolItem["category"], string> = {
    "file-tools":
      "Use this when you need fast document/image processing without opening desktop software, especially for repetitive operations and quick delivery workflows.",
    "text-tools":
      "Use this for cleaning, formatting, or transforming text before downstream tasks such as SQL, content publishing, customer communication, or automation scripts.",
    "date-time":
      "Use this for planning timelines, meeting windows, due dates, and date math where off-by-one and timezone mistakes are common.",
    converters:
      "Use this for finance, pricing, and unit conversions where decision speed matters but output consistency still needs to be auditable.",
    health:
      "Use this for quick wellness estimates and routine tracking, then validate with clinical or professional standards for medical-grade decisions.",
  };

  return [
    {
      title: "1) Input Preparation",
      content: `Start with clear, normalized inputs before you calculate. In ${tool.name}, verify units, date format, currency context, or payload format up front. One quick sample run prevents most downstream mistakes and reduces rework when you process real data.`,
    },
    {
      title: "2) Calculation Logic",
      content: logicSentence,
    },
    {
      title: "3) Output Interpretation",
      content:
        "After generating results, validate one known reference case first. If numbers or output format look off, check mode selection, boundary options, and decimal/rounding assumptions before changing your source data.",
    },
    {
      title: "4) Practical Use Cases",
      content: `${categoryUseCases[tool.category]} ${categoryTips[tool.category]}`,
    },
    {
      title: "5) Limits and Risk Control",
      content: `UsefulKit keeps ${categoryName.toLowerCase()} workflows fast and transparent, but outputs should be reviewed before legal, financial, compliance, or medical decisions. Keep a short record of key runs (inputs + outputs) so your team can audit important outcomes later.`,
    },
  ];
}

function buildFaqItems(tool: ToolItem): FaqItem[] {
  const categoryFaq: Record<ToolItem["category"], FaqItem[]> = {
    "file-tools": [
      {
        question: `What file types does ${tool.name} support?`,
        answer:
          "Supported types depend on the specific tool flow shown on this page. Upload controls list accepted formats before processing.",
      },
      {
        question: "Are my uploaded files stored on your server?",
        answer:
          "Most file workflows are processed in-browser. If any tool behavior differs, the page notes will clearly explain it.",
      },
    ],
    "text-tools": [
      {
        question: `Can I use ${tool.name.toLowerCase()} for bulk text cleanup?`,
        answer:
          "Yes. Start with a sample block first, verify output format, then run larger text batches for consistent results.",
      },
      {
        question: "Will formatting and line breaks be preserved?",
        answer:
          "That depends on the chosen action. Always preview the result before copying if formatting is business-critical.",
      },
    ],
    "date-time": [
      {
        question: `How do I avoid date and timezone mistakes in ${tool.name}?`,
        answer:
          "Confirm timezone and boundary options first, then test one known date scenario before final use.",
      },
      {
        question: "Can I use this on mobile while planning schedules?",
        answer:
          "Yes. Date and time tool pages are responsive and optimized for quick checks on phones and desktop.",
      },
    ],
    converters: [
      {
        question: `Is ${tool.name} suitable for quick business calculations?`,
        answer:
          "Yes. It is useful for fast estimates. For contracts, taxes, or compliance workflows, validate with your official process.",
      },
      {
        question: "How can I get more reliable conversion results?",
        answer:
          "Use consistent units, verify mode selection, and test with one known example before processing full inputs.",
      },
    ],
    health: [
      {
        question: `Are ${tool.name.toLowerCase()} results medical advice?`,
        answer:
          "No. Health tools provide estimates for education and planning, not diagnosis or treatment recommendations.",
      },
      {
        question: "Can I track trends over time with these tools?",
        answer:
          "Yes. Repeating calculations with consistent inputs can help track changes and support routine wellness planning.",
      },
    ],
  };

  const slugFaq: Partial<Record<ToolItem["slug"], FaqItem[]>> = {
    "excel-to-pdf": [
      {
        question: "What are the Excel to PDF limits in this tool?",
        answer:
          "Current browser-side limits are up to 2,000 rows and 30 columns per sheet for stable export performance.",
      },
      {
        question: "Can I choose which worksheet to export?",
        answer:
          "Yes. After upload, you can select a worksheet and preview rows before generating the PDF.",
      },
    ],
    "compress-pdf": [
      {
        question: "Will Compress PDF always make my file much smaller?",
        answer:
          "Not always. PDFs that are already optimized may only shrink a little, while larger or inefficiently saved files usually improve more.",
      },
      {
        question: "Is PDF compression done in the browser?",
        answer:
          "Yes. This version runs locally in your browser, which keeps the workflow fast and privacy-friendly for common office documents.",
      },
    ],
    "split-pdf": [
      {
        question: "How do I enter pages in Split PDF?",
        answer:
          "Use commas and ranges such as 1-3, 5, 8-10. The tool extracts only the valid pages you enter and keeps them in order.",
      },
      {
        question: "Does Split PDF upload my file to a server?",
        answer:
          "No. This MVP runs in your browser and creates the new PDF locally before download.",
      },
    ],
    "rotate-pdf": [
      {
        question: "Can I rotate just one page or a few pages?",
        answer:
          "Yes. Enter a page range such as 2, 4-6 to rotate only those pages, or leave the field blank to rotate the full document.",
      },
      {
        question: "Will Rotate PDF re-upload my file?",
        answer:
          "No. This tool processes the PDF in your browser and downloads the corrected file locally.",
      },
    ],
    "delete-pdf-pages": [
      {
        question: "Can I remove several PDF pages at once?",
        answer:
          "Yes. Use commas and ranges such as 1, 3-4, 8-10 to remove multiple pages in one step.",
      },
      {
        question: "Can I delete every page in the PDF?",
        answer:
          "No. At least one page must remain, so the tool blocks full-document deletion by design.",
      },
    ],
    "pdf-to-text": [
      {
        question: "Does PDF to Text work on scanned PDFs?",
        answer:
          "Usually not well. This tool is best for text-based PDFs. Scanned image PDFs usually need OCR before text extraction works properly.",
      },
      {
        question: "Can I edit the extracted text before copying it?",
        answer:
          "Yes. After extraction, the text appears in an editable box so you can clean it up before copying or downloading.",
      },
    ],
    "add-watermark-pdf": [
      {
        question: "Can I add a watermark to every page in the PDF?",
        answer:
          "Yes. This tool applies the same text watermark to every page in the exported PDF.",
      },
      {
        question: "Can I change watermark size, color, and opacity?",
        answer:
          "Yes. You can adjust watermark text, font size, color, opacity, and placement before exporting the new file.",
      },
    ],
    "jpg-to-pdf": [
      {
        question: "Can I combine multiple images into one PDF?",
        answer:
          "Yes. Upload multiple images, reorder them with the Up and Down buttons, and the final PDF will follow that page order.",
      },
      {
        question: "Does JPG to PDF only support JPG files?",
        answer:
          "No. This version accepts JPG, PNG, and WebP images, then exports them together as one PDF document.",
      },
    ],
    "hairstyle-try-on": [
      {
        question: "Is Hairstyle Try-On using a real AI model now?",
        answer:
          "This MVP supports two modes: provider mode (when API is configured) and local demo mode for instant preview.",
      },
      {
        question: "Will my uploaded portrait be permanently stored?",
        answer:
          "By default this version is preview-oriented and does not require account storage. If storage behavior changes later, it should be documented clearly on the page.",
      },
    ],
    "emoji-catalog": [
      {
        question: "Can I search emoji by keyword or name?",
        answer:
          "Yes. You can search using words like heart, smile, flag, or a specific emoji name to narrow results quickly.",
      },
      {
        question: "How do I copy an emoji from this page?",
        answer:
          "Click any emoji tile and it will copy to clipboard instantly so you can paste it in messages, captions, or documents.",
      },
    ],
    "image-mosaic": [
      {
        question: "How do I make the mosaic effect stronger?",
        answer:
          "Increase block size. Larger blocks produce more visible pixelation and stronger privacy masking.",
      },
      {
        question: "Does this tool only mosaic part of the image?",
        answer:
          "This version applies mosaic to the full image frame. Region-based mosaic can be added in a later version.",
      },
    ],
    "remove-background": [
      {
        question: "Will this remove complex backgrounds perfectly?",
        answer:
          "This MVP works best on solid or near-solid backgrounds. Busy scenes and hair-detail edges may need manual touch-up in advanced editors.",
      },
      {
        question: "Does transparent background export keep alpha?",
        answer:
          "Yes. Export as PNG (recommended) or WebP to keep transparency for product images, profile cutouts, and design workflows.",
      },
    ],
    "webp-to-jpg": [
      {
        question: "Can this convert WebP to PNG too?",
        answer:
          "Yes. The tool page is optimized for WebP to JPG keyword intent, but you can choose PNG output when you need transparency.",
      },
      {
        question: "Why does JPG output sometimes look different?",
        answer:
          "JPG is lossy and does not preserve transparency. The tool fills transparent areas with your chosen background color before export.",
      },
    ],
    "heic-to-jpg": [
      {
        question: "Is this mainly for iPhone photos?",
        answer:
          "Yes. HEIC/HEIF files commonly come from iPhone cameras, and this tool converts them into universal JPG format for upload and sharing.",
      },
      {
        question: "Will metadata be preserved after conversion?",
        answer:
          "This browser-side conversion focuses on image content compatibility. Detailed metadata preservation can vary by source file and browser.",
      },
    ],
    "gif-compressor": [
      {
        question: "How do I make GIF files much smaller?",
        answer:
          "Lower FPS, reduce scale percent, and reduce max colors. Combining all three usually gives the largest size reduction.",
      },
      {
        question: "Will quality drop after GIF compression?",
        answer:
          "Some quality loss is expected because compression reduces frames, dimensions, or palette depth. You can tune sliders to balance quality and size.",
      },
    ],
    "gif-to-mp4": [
      {
        question: "Why convert GIF to MP4?",
        answer:
          "MP4 usually loads faster and is much smaller than GIF, which improves website performance and social sharing speed.",
      },
      {
        question: "Will the animation loop in MP4?",
        answer:
          "The tool exports a standard MP4 video. Most players can loop playback if you enable loop in the player settings.",
      },
    ],
    "mp4-to-gif": [
      {
        question: "How can I keep MP4 to GIF size manageable?",
        answer:
          "Use shorter duration, lower FPS, and narrower output width. These three controls have the biggest impact on GIF size.",
      },
      {
        question: "Does this tool support long videos?",
        answer:
          "It is optimized for short clips. Long videos consume more memory in browser, so short highlights are recommended for stable conversion.",
      },
    ],
    "periodic-table": [
      {
        question: "Can I search periodic table elements by symbol or number?",
        answer:
          "Yes. You can search by element name, symbol (such as Fe), or atomic number (such as 26).",
      },
      {
        question: "Does this include lanthanides and actinides?",
        answer:
          "Yes. Both series are displayed in dedicated rows and can be filtered like other element families.",
      },
    ],
    "old-photo-restoration": [
      {
        question: "Can this restore very damaged photos perfectly?",
        answer:
          "It significantly improves many faded or lightly scratched photos, but severe tears or missing regions may still require manual retouching.",
      },
      {
        question: "Does restoration happen locally in browser?",
        answer:
          "Yes. This MVP processes images client-side in your browser for fast preview and download.",
      },
    ],
    "pdf-summarizer": [
      {
        question: "How many pages can PDF Summarizer analyze?",
        answer:
          "The summarizer is optimized for practical speed and currently analyzes up to 40 pages per document.",
      },
    ],
    "pdf-to-jpg": [
      {
        question: "Can I adjust image quality in PDF to JPG?",
        answer:
          "Yes. Use the JPG quality slider before conversion to balance image clarity and file size.",
      },
    ],
    "loan-payment-calculator": [
      {
        question: "Is this loan result exact for my lender?",
        answer:
          "Results are estimates based on entered assumptions. Lender fees, insurance, and policy differences can change final numbers.",
      },
    ],
    "md5-tool": [
      {
        question: "Can this MD5 tool decrypt hashes?",
        answer:
          "No. MD5 is a one-way hash function. This page supports hash generation and input verification only.",
      },
    ],
    "qr-code-generator": [
      {
        question: "What content can I encode in a QR code?",
        answer:
          "You can encode URLs, plain text, phone numbers, email addresses, and other text payloads that QR readers support.",
      },
      {
        question: "How can I improve QR scan success?",
        answer:
          "Use shorter content, sufficient contrast, and a moderate error-correction level, then test with multiple phone cameras before publishing.",
      },
    ],
    "company-lookup-navigator": [
      {
        question: "Is this a company database or a search navigator?",
        answer:
          "This tool is a navigator. It prepares direct links to trusted external sources where you can validate official and commercial company details.",
      },
      {
        question: "Which sources are best for legal verification?",
        answer:
          "Start with official registries and filing systems such as SEC EDGAR, Companies House, and jurisdiction registries, then use commercial databases for additional context.",
      },
    ],
    "roblox-player-lookup": [
      {
        question: "Can I search by username and by user ID?",
        answer:
          "Yes. This tool supports both lookup modes. Username mode resolves the player ID first, then fetches the same public profile details.",
      },
      {
        question: "What player data can this tool return?",
        answer:
          "It can return public profile fields such as display name, username, avatar, account creation date, and social counts when available from Roblox public endpoints.",
      },
    ],
    "ib-buying-power-simulator": [
      {
        question: "Is this simulator exactly the same as IBKR real-time margin?",
        answer:
          "No. This tool is a simplified estimator. IBKR live margin, house rules, concentration risk, and intraday changes can produce different values.",
      },
      {
        question: "How should I set initial and maintenance margin rates?",
        answer:
          "Use your observed broker requirements as inputs when possible. If unknown, many users start with 50% initial and 25% maintenance for a rough stock-only estimate.",
      },
    ],
    "word-counter": [
      {
        question: "Does word count include numbers and symbols?",
        answer:
          "Word rules can vary by platform, but this tool uses practical text-token boundaries suitable for blog drafts, docs, and SEO writing workflows.",
      },
      {
        question: "How is reading time estimated?",
        answer:
          "Reading time is a quick estimate from total words and average reading speed assumptions, useful for content planning but not a strict benchmark.",
      },
    ],
    "currency-converter": [
      {
        question: "Are conversion rates live market quotes?",
        answer:
          "This page is designed for planning and quick conversion workflows. Always confirm execution rates in your broker or bank before trading or settlement.",
      },
      {
        question: "Can I use this for invoice estimates?",
        answer:
          "Yes. It is useful for estimate-level planning, but contracts and settlement should use your official quoted or booked exchange rate.",
      },
    ],
    "sales-tax-calculator": [
      {
        question: "Does this support reverse tax calculation from final price?",
        answer:
          "Yes. Use Total-to-Pre-tax mode to extract pre-tax amount and tax amount when your input already includes tax.",
      },
      {
        question: "Can I use local city tax rates?",
        answer:
          "Yes. Enter any combined tax rate you need. For compliance workflows, verify jurisdiction-specific rules separately.",
      },
    ],
    "tip-calculator": [
      {
        question: "Can the bill be split equally across people?",
        answer:
          "Yes. The tool calculates total and per-person amount so group payments are easier to settle quickly.",
      },
      {
        question: "Should I include tax before calculating tip?",
        answer:
          "That depends on local custom. You can adjust inputs to model either pre-tax or post-tax tipping behavior.",
      },
    ],
    "unit-converter": [
      {
        question: "Will this handle decimal and scientific values?",
        answer:
          "Yes. Standard decimal inputs work well for engineering, study, and day-to-day conversion tasks.",
      },
      {
        question: "How accurate are conversions?",
        answer:
          "The tool uses deterministic conversion factors and formulas. For regulated or lab-grade work, follow your official standards.",
      },
    ],
    "tdee-calculator": [
      {
        question: "Is TDEE a guaranteed calorie target?",
        answer:
          "No. TDEE is an estimate. Real maintenance can vary by metabolism, activity tracking quality, and lifestyle changes.",
      },
      {
        question: "How often should I recalculate?",
        answer:
          "Recalculate after meaningful weight or activity changes so your calorie planning stays aligned with current conditions.",
      },
    ],
    "water-intake-calculator": [
      {
        question: "Is this hydration target medical advice?",
        answer:
          "No. It is a planning estimate. Medical conditions, medication, and climate can change hydration needs significantly.",
      },
      {
        question: "Should I include workout days separately?",
        answer:
          "Yes. Add activity minutes and heat conditions to better reflect days with higher fluid loss.",
      },
    ],
    "time-zone-converter": [
      {
        question: "Does this account for daylight saving changes?",
        answer:
          "The planner follows timezone offsets, but you should always double-check near DST switch dates for critical meetings.",
      },
      {
        question: "Can I plan across US and Asia teams?",
        answer:
          "Yes. The overlap view is designed for distributed teams and helps find workable windows across multiple regions.",
      },
    ],
    "image-compressor": [
      {
        question: "Why does compressed image size sometimes increase?",
        answer:
          "If the source is already optimized, re-encoding can occasionally increase size. Try changing output format or quality to improve results.",
      },
      {
        question: "Which format is best for web delivery?",
        answer:
          "WebP often gives better web size efficiency, while JPG remains broadly compatible for most publishing workflows.",
      },
    ],
    "image-converter": [
      {
        question: "Will converting to JPG remove transparency?",
        answer:
          "Yes. JPG does not support alpha transparency. This tool lets you set a background color before exporting JPG.",
      },
      {
        question: "Is PNG always smaller than JPG?",
        answer:
          "Not always. PNG is lossless and can be larger for photos. JPG or WebP can be smaller for photographic content.",
      },
    ],
    "image-resizer": [
      {
        question: "How do I avoid stretching images?",
        answer:
          "Enable aspect-ratio lock when resizing. Use presets only when target aspect intentionally differs from source.",
      },
      {
        question: "Can I prepare social-media dimensions quickly?",
        answer:
          "Yes. Built-in presets help generate common social dimensions with fewer manual edits.",
      },
    ],
    "png-to-jpg": [
      {
        question: "Why can converted JPG look different from PNG?",
        answer:
          "PNG transparency must be flattened into a background color in JPG, and JPG compression can introduce small visual differences.",
      },
      {
        question: "What background should I use for transparent PNGs?",
        answer:
          "Use white for docs/ecommerce defaults, or match your target page color to avoid visible edge halos.",
      },
    ],
    "jpg-to-png": [
      {
        question: "Does JPG to PNG improve photo quality?",
        answer:
          "Converting to PNG does not restore information lost in JPG compression. It mainly changes format compatibility.",
      },
      {
        question: "When should I convert JPG to PNG?",
        answer:
          "Use PNG when your downstream workflow requires lossless editing or consistent non-JPG format support.",
      },
    ],
    "ev-charging-cost-calculator": [
      {
        question: "Do state selections affect EV charging estimates?",
        answer:
          "Yes. State selection changes default electricity assumptions, which directly affects estimated charging cost.",
      },
    ],
    "subscription-waste-finder": [
      {
        question: "What columns should my CSV include?",
        answer:
          "Use typical bank/card exports with date, description or merchant, and debit/credit amount fields for best detection quality.",
      },
    ],
  };

  const commonFaq: FaqItem[] = [
    {
      question: `Is ${tool.name} free to use?`,
      answer: `Yes. ${tool.name} on UsefulKit is free and does not require account signup.`,
    },
    {
      question: `Can I use ${tool.name.toLowerCase()} on mobile?`,
      answer:
        "Yes. The page is responsive and supports modern mobile browsers, including iOS and Android devices.",
    },
    {
      question: "Are my files or text uploaded to a server?",
      answer:
        "Most tools process data directly in the browser. For any tool with different behavior, the page notes will clearly explain it.",
    },
    {
      question: "How do I get more accurate results?",
      answer:
        "Use clean inputs, confirm units and mode selection, and test with one known example before running full data.",
    },
    {
      question: "Can I use this result for business or compliance work?",
      answer:
        "You can use it as a fast estimate or workflow aid, but for high-stakes decisions you should validate with your official process.",
    },
  ];

  const merged = [
    ...(slugFaq[tool.slug] ?? []),
    ...categoryFaq[tool.category],
    ...commonFaq,
  ];

  return merged.slice(0, 6);
}

function buildQuickAnswer(tool: ToolItem, categoryName: string): string[] {
  const slugSpecific: Partial<Record<ToolItem["slug"], string[]>> = {
    "paycheck-calculator": [
      "Estimate per-paycheck take-home pay from salary or hourly input and pay frequency.",
      "Inputs: gross income, pay schedule, pre-tax deductions, and tax-rate assumptions.",
      "Outputs: gross pay, tax breakdown, and net pay per paycheck plus annual estimates.",
    ],
    "time-card-calculator": [
      "Calculate weekly worked hours from daily clock-in and clock-out entries.",
      "Inputs: each day in/out time, break minutes, hourly rate, overtime threshold.",
      "Outputs: total hours, overtime hours, and estimated gross weekly pay.",
    ],
    "days-from-today": [
      "Find an exact date by adding or subtracting days from a base date.",
      "Inputs: base date, offset days, calendar or business-day mode.",
      "Outputs: target date in ISO and human-readable format.",
    ],
    "qr-code-generator": [
      "Generate a downloadable QR code from URL or text content.",
      "Inputs: content, size, colors, margin, and error-correction level.",
      "Outputs: scan-ready QR preview and PNG download.",
    ],
    "company-lookup-navigator": [
      "Generate one-click lookup links across official and commercial company sources.",
      "Inputs: company name and optional domain.",
      "Outputs: direct query links for filings, registry checks, and reputation checks.",
    ],
    "roblox-player-lookup": [
      "Look up public Roblox player profile information from username or user ID.",
      "Inputs: Roblox username or numeric user ID.",
      "Outputs: avatar, display name, account creation date, and social counts.",
    ],
    "ib-buying-power-simulator": [
      "Estimate remaining buying power from three stock positions (A/B/C) using configurable margin assumptions.",
      "Inputs: net liquidation value, each position market value, and initial/maintenance margin rates.",
      "Outputs: margin used, initial excess, maintenance excess, and remaining estimated buying power.",
    ],
    "word-counter": [
      "Count words, characters, lines, and estimated reading time while drafting content.",
      "Inputs: pasted or typed text.",
      "Outputs: real-time count metrics for writing, publishing, and SEO workflows.",
    ],
    "character-counter": [
      "Track character limits for posts, ads, titles, and form fields.",
      "Inputs: any text content.",
      "Outputs: total characters, optional whitespace awareness, and quick limit checking.",
    ],
    "case-converter": [
      "Convert text casing for documents, code snippets, and content formatting.",
      "Inputs: source text and target case style.",
      "Outputs: converted text for immediate copy and reuse.",
    ],
    "currency-converter": [
      "Estimate cross-currency amounts quickly for planning and budgeting.",
      "Inputs: amount, source currency, target currency.",
      "Outputs: converted value using current configured reference rates.",
    ],
    "sales-tax-calculator": [
      "Calculate final checkout totals or reverse-calculate pre-tax values.",
      "Inputs: amount and sales-tax rate with forward/reverse mode.",
      "Outputs: tax amount, pre-tax amount, and final total.",
    ],
    "discount-tax-calculator": [
      "Model retail checkout totals when discount and sales tax both apply.",
      "Inputs: original price, discount rate, tax rate.",
      "Outputs: discounted subtotal, tax amount, and final payable total.",
    ],
    "tip-calculator": [
      "Compute tip and split bill amounts for group payments.",
      "Inputs: bill subtotal, tip rate, and party size.",
      "Outputs: tip amount, total bill, and per-person share.",
    ],
    "markup-margin-calculator": [
      "Solve pricing math between cost, selling price, markup, and margin.",
      "Inputs: known pricing fields based on selected mode.",
      "Outputs: inferred pricing metrics for quoting and planning.",
    ],
    "apr-calculator": [
      "Estimate APR or payment impact for fixed-term loan assumptions.",
      "Inputs: principal, term, and either APR or payment target.",
      "Outputs: estimated APR/payment plus interest summary.",
    ],
    "unit-converter": [
      "Convert units across length, weight, area, and temperature categories.",
      "Inputs: value, source unit, target unit.",
      "Outputs: instant converted value with deterministic formulas.",
    ],
    "tdee-calculator": [
      "Estimate maintenance calories from body metrics and activity level.",
      "Inputs: age, sex, height, weight, activity profile.",
      "Outputs: BMR, TDEE, and suggested cut/bulk targets.",
    ],
    "water-intake-calculator": [
      "Estimate daily hydration targets with activity and climate adjustments.",
      "Inputs: body weight, activity minutes, heat condition.",
      "Outputs: recommended daily water intake in liters and cups.",
    ],
    "time-zone-converter": [
      "Find practical meeting windows across multiple time zones.",
      "Inputs: participant time zones, local work windows, duration.",
      "Outputs: overlap slots suitable for scheduling distributed teams.",
    ],
    "ev-charging-cost-calculator": [
      "Estimate EV charging spend with state electricity assumptions and charging mix.",
      "Inputs: vehicle efficiency, mileage, home/public charging ratio.",
      "Outputs: monthly and annual EV cost plus gas comparison.",
    ],
    "ev-trip-charging-cost-planner": [
      "Plan charging stops, charging time, and trip energy cost for long EV routes.",
      "Inputs: trip distance, battery assumptions, charging strategy.",
      "Outputs: stop count, charging duration, and EV vs gas trip cost.",
    ],
    "merge-pdf": [
      "Combine multiple PDFs into one ordered document.",
      "Inputs: two or more PDF files and preferred merge order.",
      "Outputs: a single merged PDF ready for download.",
    ],
    "pdf-to-jpg": [
      "Convert each PDF page into an image for slides, thumbnails, or previews.",
      "Inputs: one PDF and optional JPG quality choice.",
      "Outputs: page-by-page JPG files for download.",
    ],
    "pdf-summarizer": [
      "Generate a concise summary from PDF text content.",
      "Inputs: one text-readable PDF document.",
      "Outputs: key points and compact summary text for fast review.",
    ],
    "png-to-jpg": [
      "Convert PNG to JPG with transparency background control.",
      "Inputs: PNG file, JPG quality, and background color.",
      "Outputs: JPG image with size and output preview.",
    ],
    "jpg-to-png": [
      "Convert JPG/JPEG images to PNG format for workflow compatibility.",
      "Inputs: JPG or JPEG source image.",
      "Outputs: PNG file with immediate preview and download.",
    ],
    "image-compressor": [
      "Reduce image file size for faster upload and delivery.",
      "Inputs: JPG/PNG/WebP plus quality/format options.",
      "Outputs: compressed file with before/after size comparison.",
    ],
    "image-converter": [
      "Convert images between JPG, PNG, and WebP quickly.",
      "Inputs: image file and target format settings.",
      "Outputs: converted image with output stats and preview.",
    ],
    "image-resizer": [
      "Resize images for social media, ads, and web layouts.",
      "Inputs: source image plus target dimensions or preset.",
      "Outputs: resized image with download and size feedback.",
    ],
    "remove-line-breaks": [
      "Flatten multiline text into single-line output for SQL and scripts.",
      "Inputs: multiline text and replacement separator.",
      "Outputs: normalized one-line text ready to copy.",
    ],
    "id-list-formatter": [
      "Format one-ID-per-line input into delimiter-ready output.",
      "Inputs: ID list and suffix symbol (comma, semicolon, custom).",
      "Outputs: batch-formatted ID lines for copy/paste workflows.",
    ],
    "subscription-waste-finder": [
      "Analyze recurring charge CSVs to surface possible subscription waste.",
      "Inputs: transaction CSV with date, merchant, amount.",
      "Outputs: recurring charge clusters and suspected waste signals.",
    ],
    "subscription-downgrade-optimizer": [
      "Compare subscription plan strategies to reduce monthly spend.",
      "Inputs: current costs and strategy toggles (annual, ad-tier, bundle).",
      "Outputs: estimated optimized total and projected savings.",
    ],
    "quarterly-tax-safe-pay-planner": [
      "Plan quarterly tax payments from projected income assumptions.",
      "Inputs: annual income estimate, deductions, withholding, tax rate.",
      "Outputs: suggested quarterly amounts and due-date planning targets.",
    ],
    "compress-pdf": [
      "Reduce PDF file size before sending, uploading, or archiving documents.",
      "Inputs: a PDF file and selected compression level.",
      "Outputs: smaller downloadable PDF plus size savings summary.",
    ],
    "split-pdf": [
      "Extract only the pages you need from a larger PDF without opening desktop software.",
      "Inputs: one PDF file and a page range such as 1-3, 5, 8-10.",
      "Outputs: a new downloadable PDF containing only the selected pages.",
    ],
    "rotate-pdf": [
      "Fix sideways or upside-down PDFs without reopening the source file in desktop software.",
      "Inputs: one PDF file, a rotation angle, and optional page ranges.",
      "Outputs: a corrected downloadable PDF with updated page orientation.",
    ],
    "delete-pdf-pages": [
      "Remove unwanted cover sheets, blank pages, or appendix pages from a PDF in one browser-based step.",
      "Inputs: one PDF file and the pages or ranges you want to delete.",
      "Outputs: a cleaned downloadable PDF with only the remaining pages.",
    ],
    "pdf-to-text": [
      "Extract plain text from contracts, reports, and exported PDFs without opening desktop software.",
      "Inputs: one text-based PDF file.",
      "Outputs: editable plain text that you can copy or download as a TXT file.",
    ],
    "add-watermark-pdf": [
      "Mark review copies, internal drafts, and client-delivery documents with a clear PDF watermark.",
      "Inputs: one PDF file plus watermark text, color, opacity, size, and placement settings.",
      "Outputs: a downloadable watermarked PDF with the same text stamped on every page.",
    ],
    "jpg-to-pdf": [
      "Turn one or more images into a printable, shareable PDF without installing desktop software.",
      "Inputs: JPG, PNG, or WebP images plus your preferred page order.",
      "Outputs: a downloadable PDF document with one image per page.",
    ],
    "emoji-catalog": [
      "Find and copy emoji quickly for social posts, comments, chats, and product descriptions.",
      "Inputs: search keyword and optional emoji category filter.",
      "Outputs: filtered emoji grid with one-click copy interaction.",
    ],
    "hairstyle-try-on": [
      "Preview hairstyle and hair color combinations before visiting a salon.",
      "Inputs: portrait photo, selected hairstyle preset, and target hair color.",
      "Outputs: side-by-side original image and hairstyle preview image.",
    ],
    "image-mosaic": [
      "Apply censorship-style pixelation for privacy and content masking workflows.",
      "Inputs: source image, block size, and output format.",
      "Outputs: full-frame mosaic image with before/after preview and downloadable file.",
    ],
    "remove-background": [
      "Remove solid or near-solid image backgrounds for e-commerce, profile photos, and design assets.",
      "Inputs: image upload, threshold, softness, and output format selection.",
      "Outputs: transparent PNG/WebP file with side-by-side preview and download.",
    ],
    "webp-to-jpg": [
      "Convert WebP images into JPG for broader compatibility or PNG when transparency is required.",
      "Inputs: WebP file, output format, and optional JPG quality/background color.",
      "Outputs: converted file with instant preview and downloadable result.",
    ],
    "heic-to-jpg": [
      "Convert iPhone HEIC/HEIF images into standard JPG for web uploads and cross-platform sharing.",
      "Inputs: HEIC or HEIF file and JPG quality setting.",
      "Outputs: downloadable JPG file with output size preview.",
    ],
    "gif-compressor": [
      "Reduce animated GIF file size for faster upload, email sharing, and web embedding.",
      "Inputs: GIF upload plus FPS, scale, and max-color settings.",
      "Outputs: compressed GIF with side-by-side preview and saved-size metrics.",
    ],
    "gif-to-mp4": [
      "Convert GIF animations to MP4 for better playback compatibility and lower bandwidth usage.",
      "Inputs: GIF upload plus target FPS and quality controls.",
      "Outputs: downloadable MP4 file and before/after size comparison.",
    ],
    "mp4-to-gif": [
      "Create shareable GIF loops from short MP4 clips for social media and support docs.",
      "Inputs: MP4 upload plus target FPS, width, and clip duration.",
      "Outputs: downloadable GIF with instant preview and size comparison.",
    ],
    "periodic-table": [
      "Explore chemical elements quickly for study, classroom, and lab reference workflows.",
      "Inputs: search query and optional family filter.",
      "Outputs: interactive table highlighting matched elements with quick detail panel.",
    ],
    "old-photo-restoration": [
      "Repair scanned or photographed vintage images for clearer sharing and archiving.",
      "Inputs: old photo upload and restoration sliders for denoise, fade fix, scratch fix, and sharpness.",
      "Outputs: before/after preview and downloadable restored JPG.",
    ],
  };

  if (slugSpecific[tool.slug]) return slugSpecific[tool.slug]!;

  return [
    `${tool.name} is a free online ${categoryName.toLowerCase()} utility for fast task completion.`,
    "Enter your required values, select the appropriate mode, and review instant output.",
    "Use the result for quick workflow support, then validate for high-stakes decisions.",
  ];
}

function buildMethodology(tool: ToolItem): string[] {
  const methods: Partial<Record<ToolItem["slug"], string[]>> = {
    "percentage-calculator": [
      "Core formulas include: part = base * rate, and rate = part / base.",
      "Increase/decrease modes apply multiplicative change to the original base value.",
      "All outputs are deterministic from provided numeric inputs.",
    ],
    "loan-payment-calculator": [
      "Monthly payment uses standard amortization with fixed rate and fixed term assumptions.",
      "Interest is derived from periodic rate and remaining principal over each payment cycle.",
      "Displayed totals are estimates and may differ from lender-specific fee structures.",
    ],
    "paycheck-calculator": [
      "Gross pay is derived from salary/hourly inputs and selected pay frequency.",
      "Tax amounts are estimated from user-entered federal, state, local, and FICA assumptions.",
      "Net pay = gross pay - pre-tax deductions - estimated taxes.",
    ],
    "ib-buying-power-simulator": [
      "Each position contributes initial and maintenance requirements based on its market value and configured margin rates.",
      "Initial excess is estimated as net liquidation value minus total initial margin required across A/B/C positions.",
      "Remaining buying power is approximated by dividing initial excess by the assumed initial margin rate for the next trade.",
    ],
    "time-card-calculator": [
      "Daily worked minutes = (clock out - clock in) - break minutes, with overnight support.",
      "Weekly total is summed across days, then split into regular and overtime buckets.",
      "Gross pay = regular hours * rate + overtime hours * rate * overtime multiplier.",
    ],
    "days-between-dates": [
      "Date difference is computed from normalized calendar-day boundaries.",
      "Optional inclusive mode adjusts boundary-day counting behavior.",
      "Output includes absolute day count and derived week/day breakdown.",
    ],
    "days-from-today": [
      "Calendar mode applies direct day offsets from local midnight boundary.",
      "Business mode advances or rewinds by weekdays only (Mon-Fri).",
      "Include-start option adjusts offset interpretation for boundary counting.",
    ],
    "qr-code-generator": [
      "QR matrix is generated from input payload with selected error-correction level (L/M/Q/H).",
      "Rendering parameters include pixel width, quiet-zone margin, and foreground/background colors.",
      "Output is encoded as PNG data URL for direct download.",
    ],
    "compress-pdf": [
      "The PDF is loaded client-side and re-saved with optimized object stream settings to reduce overhead.",
      "Compression strength determines how aggressively the browser-side save step optimizes the document structure.",
      "The output file is generated locally and downloaded directly without server-side storage.",
    ],
    "split-pdf": [
      "The original PDF is parsed client-side and total page count is read before extraction begins.",
      "Page range text is normalized into zero-based page indexes, with invalid or out-of-range values ignored safely.",
      "Only the selected pages are copied into a new PDF file, which is then generated locally for download.",
    ],
    "rotate-pdf": [
      "The PDF is loaded client-side and existing page rotation metadata is read before applying changes.",
      "Page ranges are converted into valid zero-based page indexes so only the intended pages are updated.",
      "Each selected page receives the chosen additional rotation, then the corrected PDF is generated locally for download.",
    ],
    "delete-pdf-pages": [
      "The PDF is loaded client-side and page count is read before any deletion runs.",
      "Page range text is converted into a validated list of target pages, while out-of-range values are ignored safely.",
      "Selected pages are removed from the end toward the beginning so page indexes remain stable during deletion.",
    ],
    "pdf-to-text": [
      "The PDF is parsed in the browser and text items are collected page by page.",
      "Extracted text fragments are merged into readable plain text output, with page breaks preserved as spacing.",
      "This workflow is strongest on text-based PDFs; scanned image PDFs usually require OCR that is not part of this tool.",
    ],
    "add-watermark-pdf": [
      "The PDF is loaded client-side and each page is processed in sequence before export.",
      "Watermark text is drawn directly onto every page using browser-side PDF rendering primitives with your selected styling.",
      "The final watermarked PDF is generated locally, which keeps the workflow fast and avoids server-side storage.",
    ],
    "jpg-to-pdf": [
      "Each uploaded image is read locally in the browser and measured before export.",
      "The export keeps your chosen image order and creates one PDF page per image.",
      "Images are scaled to fit the page area with margins while preserving aspect ratio for cleaner print and upload workflows.",
    ],
    "emoji-catalog": [
      "Emoji entries are organized by predefined categories and indexed with keyword metadata.",
      "Search runs deterministic string matching against emoji names and keyword tags.",
      "Copy action writes the selected emoji symbol directly to clipboard for immediate reuse.",
    ],
    "hairstyle-try-on": [
      "The tool accepts an uploaded image as input and applies selected style and color parameters.",
      "When provider integration is configured, preview output can come from external AI inference.",
      "If no provider is configured, local canvas rendering generates a quick visual mock for decision support.",
    ],
    "image-mosaic": [
      "The source image is rendered to canvas, reduced to a coarse grid, then scaled back to original size.",
      "Image smoothing is disabled during upscaling to preserve hard pixel blocks.",
      "Output is exported to selected format (JPG/PNG/WebP) for direct download.",
    ],
    "remove-background": [
      "Corner patches are sampled to estimate likely background color across image boundaries.",
      "Per-pixel distance to sampled background colors is converted into alpha transparency using threshold and softness controls.",
      "The output keeps transparent pixels in PNG/WebP format for direct download and reuse.",
    ],
    "webp-to-jpg": [
      "WebP is decoded in browser canvas, then re-encoded to the selected output format.",
      "For JPG output, transparent pixels are flattened against your chosen background color.",
      "For PNG output, alpha transparency is preserved with lossless export behavior.",
    ],
    "heic-to-jpg": [
      "Uploaded HEIC/HEIF image data is decoded client-side and re-encoded as JPEG.",
      "Quality slider controls JPEG compression to balance file size and visual detail.",
      "Output is generated in-browser for quick download without server-side file storage.",
    ],
    "gif-compressor": [
      "The source GIF is decoded and re-encoded with a regenerated palette and adjusted frame pipeline.",
      "Compression impact comes from three levers: frame rate, scale ratio, and max color count.",
      "The result is exported as a looping GIF directly in the browser session.",
    ],
    "gif-to-mp4": [
      "Animated GIF frames are transcoded to H.264 MP4 with yuv420p output for broad player compatibility.",
      "Frame rate control reduces redundant animation frames while preserving motion readability.",
      "Faststart MP4 metadata improves progressive playback on modern browsers and apps.",
    ],
    "mp4-to-gif": [
      "The video input is trimmed to the selected duration before GIF encoding to control output size.",
      "Palette generation and paletteuse stages improve color quality for animated GIF output.",
      "Output width and FPS directly influence memory usage and final GIF size.",
    ],
    "periodic-table": [
      "Element records are organized by atomic number, period, and group in a structured dataset.",
      "Search and filter are deterministic string and category matches against that dataset.",
      "Selected-element panel reads directly from the same indexed element source for consistency.",
    ],
    "old-photo-restoration": [
      "The image is normalized to a safe working size, then passed through denoise and tonal enhancement stages.",
      "Pixel-level adjustments rebalance contrast, saturation, and color fade to recover visual clarity.",
      "Scratch reduction identifies abrupt outlier pixels and blends them with neighboring context to reduce visible defects.",
    ],
  };

  return (
    methods[tool.slug] ?? [
      "Outputs are generated from transparent, deterministic processing based on user input.",
      "No hidden weighting or opaque scoring is applied to the visible result.",
      "For compliance-sensitive usage, validate results with your official calculation workflow.",
    ]
  );
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  const relatedTools = getToolsByCategory(tool.category).filter((item) => item.slug !== tool.slug);
  const usageGuide = buildUsageGuide(tool, categoryLabels[tool.category]);
  const faqItems = buildFaqItems(tool);
  const quickAnswer = buildQuickAnswer(tool, categoryLabels[tool.category]);
  const methodology = buildMethodology(tool);
  const popularSearches = toolKeywordClusters[tool.slug] ?? [];
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const softwareAppData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: `${categoryLabels[tool.category]}Application`,
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://usefulkit.io/tools/${tool.slug}`,
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://usefulkit.io",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabels[tool.category],
        item: `https://usefulkit.io/categories/${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://usefulkit.io/tools/${tool.slug}`,
      },
    ],
  };
  const howItWorks =
    tool.slug === "word-counter"
      ? [
          "Paste or type content in the text area.",
          "UsefulKit updates counts and time estimates instantly.",
          "Use the numbers for writing, SEO, and social publishing tasks.",
        ]
      : tool.slug === "age-calculator"
        ? [
            "Select your date of birth.",
            "Choose the date you want to calculate age at.",
            "Get age breakdown, total days lived, and next birthday countdown.",
          ]
        : tool.slug === "character-counter"
          ? [
              "Paste or type text in the input box.",
              "Track characters, words, lines, and sentence count.",
              "Clear text in one click when done.",
            ]
        : tool.slug === "case-converter"
          ? [
              "Paste text and choose a case style.",
              "Convert to upper, lower, title, or sentence case.",
              "Copy converted text instantly.",
            ]
        : tool.slug === "emoji-catalog"
          ? [
              "Choose a category or keep all categories enabled.",
              "Search emoji by name or keyword.",
              "Click any emoji tile to copy it instantly.",
            ]
        : tool.slug === "qr-code-generator"
          ? [
              "Enter a URL, text, or contact payload.",
              "Adjust QR size, colors, margin, and error correction.",
              "Download PNG and test scan before publishing.",
            ]
        : tool.slug === "company-lookup-navigator"
          ? [
              "Enter company name and optional domain once.",
              "Generate one-click links to official and commercial lookup sites.",
              "Open each source to verify filings, profile, and reputation signals.",
            ]
        : tool.slug === "roblox-player-lookup"
          ? [
              "Choose lookup mode: username or numeric user ID.",
              "Submit your query and fetch public profile information from Roblox endpoints.",
              "Review avatar, account details, and social counts in one panel.",
            ]
        : tool.slug === "ib-buying-power-simulator"
          ? [
              "Enter your net liquidation value and assumed initial margin for new trades.",
              "Fill A/B/C position values and margin rates (initial and maintenance).",
              "Review remaining buying power and margin excess estimates instantly.",
            ]
        : tool.slug === "compress-pdf"
          ? [
              "Upload the PDF you want to reduce in size.",
              "Choose a balanced or strong compression mode.",
              "Download the optimized PDF and review the saved space.",
            ]
        : tool.slug === "split-pdf"
          ? [
              "Upload the PDF document you want to split.",
              "Enter the pages or page ranges you want to extract.",
              "Download the new PDF containing only the selected pages.",
            ]
        : tool.slug === "rotate-pdf"
          ? [
              "Upload the PDF document that has sideways or upside-down pages.",
              "Choose a rotation angle and optionally specify which pages to rotate.",
              "Download the corrected PDF with updated page orientation.",
            ]
        : tool.slug === "delete-pdf-pages"
          ? [
              "Upload the PDF document you want to clean up.",
              "Enter the pages or ranges you want to remove from the file.",
              "Download the new PDF that keeps only the remaining pages.",
            ]
        : tool.slug === "pdf-to-text"
          ? [
              "Upload a text-based PDF document from your device.",
              "UsefulKit extracts readable text from each page in your browser.",
              "Copy the result or download it as a plain TXT file.",
            ]
        : tool.slug === "add-watermark-pdf"
          ? [
              "Upload the PDF document you want to mark.",
              "Set watermark text, style, opacity, and placement.",
              "Download the new PDF with your watermark applied to every page.",
            ]
        : tool.slug === "jpg-to-pdf"
          ? [
              "Upload one or more JPG, PNG, or WebP images.",
              "Reorder them so the page sequence matches your final document.",
              "Create and download one PDF with each image placed on its own page.",
            ]
        : tool.slug === "days-between-dates"
          ? [
              "Select start and end dates.",
              "Toggle whether to include boundary dates.",
              "Get total days and week-plus-day breakdown.",
            ]
        : tool.slug === "days-from-today"
          ? [
              "Choose a base date and enter positive or negative day offset.",
              "Switch between calendar days and business days.",
              "Get the exact target date with instant update.",
            ]
        : tool.slug === "markup-margin-calculator"
          ? [
              "Choose pricing mode based on your data.",
              "Calculate markup, margin, and profit instantly.",
              "Use results to optimize product pricing.",
            ]
        : tool.slug === "time-zone-converter"
          ? [
              "Pick timezones and work windows for each participant.",
              "Set meeting date and duration.",
              "Get overlap slots shown in each participant's local time.",
            ]
        : tool.slug === "id-list-formatter"
          ? [
              "Paste IDs with one ID per line.",
              "Set a suffix symbol, such as a comma or semicolon.",
              "Copy the formatted list for SQL, scripts, or batch operations.",
            ]
        : tool.slug === "image-compressor"
          ? [
              "Upload a JPG, PNG, or WebP image.",
              "Tune quality and output format.",
              "Download compressed output with size savings.",
            ]
        : tool.slug === "heic-to-jpg"
          ? [
              "Upload a HEIC or HEIF image from iPhone or other sources.",
              "Set JPG quality based on your sharing or upload needs.",
              "Convert and download a standard JPG file instantly.",
            ]
        : tool.slug === "gif-compressor"
          ? [
              "Upload your animated GIF file.",
              "Tune FPS, scale, and color count for target size.",
              "Compress and download the optimized GIF output.",
            ]
        : tool.slug === "gif-to-mp4"
          ? [
              "Upload a GIF animation file.",
              "Adjust FPS and quality settings based on target size.",
              "Convert and download MP4 for faster playback.",
            ]
        : tool.slug === "mp4-to-gif"
          ? [
              "Upload a short MP4 clip.",
              "Set duration, width, and FPS for your target output.",
              "Convert and download looping GIF output.",
            ]
        : tool.slug === "webp-to-jpg"
          ? [
              "Upload a WebP image file.",
              "Choose JPG for compatibility or PNG for transparent output.",
              "Convert and download your new file with preview.",
            ]
        : tool.slug === "remove-background"
          ? [
              "Upload a product photo or portrait with a mostly solid background.",
              "Adjust threshold and edge softness for cleaner cutout edges.",
              "Export transparent PNG/WebP and download instantly.",
            ]
        : tool.slug === "png-to-jpg"
          ? [
              "Upload a PNG image.",
              "Set JPG quality and transparent background color.",
              "Download JPG output and compare file size.",
            ]
        : tool.slug === "jpg-to-png"
          ? [
              "Upload a JPG or JPEG image.",
              "Convert to PNG with a single click.",
              "Download PNG output and compare file size.",
            ]
        : tool.slug === "image-converter"
          ? [
              "Upload one image file.",
              "Select target format: JPG, PNG, or WebP.",
              "Convert and download in one flow.",
            ]
        : tool.slug === "image-mosaic"
          ? [
              "Upload a source image file.",
              "Set block size and output format.",
              "Generate and download full-image mosaic output.",
            ]
        : tool.slug === "periodic-table"
          ? [
              "Search by element name, symbol, or atomic number.",
              "Use family filters to narrow to element groups.",
              "Click any element tile to inspect key details instantly.",
            ]
        : tool.slug === "image-resizer"
          ? [
              "Upload an image and set width and height.",
              "Use custom size or quick social presets.",
              "Resize and download instantly.",
            ]
        : tool.slug === "old-photo-restoration"
          ? [
              "Upload an old or faded photo from your device.",
              "Tune restoration sliders such as denoise, fade correction, and scratch reduction.",
              "Generate restored output, compare before/after, and download the result.",
            ]
        : tool.slug === "percentage-calculator"
                        ? [
                            "Pick a percentage calculation mode.",
                            "Enter values and get instant results.",
                            "Use formula hints for quick verification.",
                          ]
        : tool.slug === "tip-calculator"
          ? [
              "Enter bill amount, tip, tax, and number of people.",
              "Get tip amount and total bill instantly.",
              "See per-person split in one view.",
            ]
        : tool.slug === "loan-payment-calculator"
          ? [
              "Enter loan amount, annual interest rate, and loan term.",
              "UsefulKit calculates your estimated monthly payment instantly.",
              "Review total repayment, total interest, and first-month breakdown.",
            ]
        : tool.slug === "paycheck-calculator"
          ? [
              "Select salary or hourly mode and set pay frequency.",
              "Enter pre-tax deduction and tax rate assumptions.",
              "Review estimated gross, tax breakdown, and take-home pay per paycheck.",
            ]
        : tool.slug === "time-card-calculator"
          ? [
              "Enter clock-in and clock-out times for each workday.",
              "Set break minutes, hourly rate, and overtime rules.",
              "Get weekly total hours, overtime hours, and estimated gross pay.",
            ]
        : tool.slug === "sales-tax-calculator"
          ? [
              "Choose whether you are adding tax or extracting tax from total.",
              "Enter amount and tax rate.",
              "Get pre-tax amount, tax amount, and final total instantly.",
            ]
        : tool.slug === "discount-tax-calculator"
          ? [
              "Enter original price, discount percent, and sales tax rate.",
              "UsefulKit applies discount first, then calculates tax.",
              "Review discount amount, tax amount, and final checkout total.",
            ]
        : tool.slug === "apr-calculator"
          ? [
              "Choose APR-to-payment or payment-to-APR mode.",
              "Enter loan amount and term months with APR or monthly payment.",
              "Get estimated APR, monthly payment, and total interest instantly.",
            ]
        : tool.slug === "subscription-waste-finder"
          ? [
              "Upload a bank or card CSV file.",
              "UsefulKit detects recurring charges and normalizes merchant names.",
              "Review duplicate/price-increase flags and export a cancel list CSV.",
            ]
        : tool.slug === "subscription-downgrade-optimizer"
          ? [
              "Enter your current monthly subscription costs by category.",
              "Toggle strategy switches like ad tiers, bundles, and annual billing.",
              "Compare current cost vs optimized cost and projected annual savings.",
            ]
        : tool.slug === "quarterly-tax-safe-pay-planner"
          ? [
              "Enter expected annual income, deductions, and tax withheld.",
              "Set your effective federal tax rate and self-employment toggle.",
              "Get suggested quarterly payments with due-date schedule.",
            ]
        : tool.slug === "ev-charging-cost-calculator"
          ? [
              "Choose your U.S. state and enter EV driving details.",
              "Set home/public charging mix and off-peak discount assumptions.",
              "Compare EV monthly/annual charging cost against gasoline baseline.",
            ]
        : tool.slug === "ev-trip-charging-cost-planner"
          ? [
              "Enter trip distance, vehicle efficiency, and battery details.",
              "Set charging strategy assumptions like charge window, DC rate, and stop overhead.",
              "Get charging stops, trip charging time, EV cost, and gas-trip comparison.",
            ]
        : tool.slug === "md5-tool"
          ? [
              "Enter any text to generate its MD5 hash instantly.",
              "Use verify mode to test whether text matches a known MD5 hash.",
              "Review weak-input warning and avoid MD5 for secure password storage.",
            ]
        : tool.slug === "pdf-to-jpg"
          ? [
              "Upload a PDF document from your device.",
              "UsefulKit renders each page and converts it to JPG.",
              "Download each page image separately.",
            ]
        : tool.slug === "merge-pdf"
          ? [
              "Upload two or more PDF files.",
              "Reorder files with Up/Down controls.",
              "Merge all pages and download one combined PDF.",
            ]
        : tool.slug === "pdf-summarizer"
          ? [
              "Upload a PDF document from your device.",
              "UsefulKit extracts text and ranks important sentences.",
              "Read key points and a concise summary instantly.",
            ]
        : tool.slug === "excel-to-pdf"
          ? [
              "Upload an .xlsx or .csv file from your device.",
              "Choose the worksheet you want to export and preview rows.",
              "Export a paginated PDF file directly in your browser.",
            ]
        : tool.slug === "hairstyle-try-on"
          ? [
              "Upload a clear portrait photo.",
              "Pick a hairstyle preset and hair color.",
              "Generate side-by-side preview before and after style simulation.",
            ]
        : tool.slug === "currency-converter"
          ? [
              "Select source and target currencies.",
              "Enter amount to get converted value instantly.",
              "Adjust base rates when needed.",
            ]
        : tool.slug === "bmi-calculator"
          ? [
              "Choose metric or imperial input mode.",
              "Enter height and weight values.",
              "Get BMI score and weight category instantly.",
            ]
        : tool.slug === "unit-converter"
          ? [
              "Choose a category such as length, weight, temperature, or area.",
              "Set from-unit and to-unit.",
              "Enter value to get instant conversion results.",
            ]
        : tool.slug === "remove-line-breaks"
          ? [
              "Paste multiline text input.",
              "Choose replacement characters for line breaks.",
              "Copy a clean single-line result.",
            ]
        : tool.slug === "tdee-calculator"
          ? [
              "Enter age, sex, height, and weight in metric or imperial mode.",
              "Pick your activity level based on your weekly routine.",
              "Get BMR, maintenance calories (TDEE), and cut/bulk targets.",
            ]
        : tool.slug === "water-intake-calculator"
          ? [
              "Enter body weight in kg or lb mode.",
              "Add activity minutes and heat condition.",
              "Get recommended daily intake in liters and cups.",
            ]
        : [
            "Enter your values in the input panel.",
            "UsefulKit calculates output in real time.",
            "Copy or export the result for your workflow.",
          ];
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    description: `Step-by-step usage guide for ${tool.name}.`,
    step: howItWorks.map((item, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: item,
      text: item,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/categories/${tool.category}`} className="transition hover:text-brand">
              {categoryLabels[tool.category]}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">{tool.name}</li>
        </ol>
      </nav>

      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          {categoryLabels[tool.category]}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
        <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{tool.summary}</p>
      </header>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold">Quick Answer</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted sm:text-base">
          {quickAnswer.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {tool.slug === "word-counter" ? <WordCounterTool /> : null}
      {tool.slug === "character-counter" ? <CharacterCounterTool /> : null}
      {tool.slug === "case-converter" ? <CaseConverterTool /> : null}
      {tool.slug === "compress-pdf" ? <CompressPdfTool /> : null}
      {tool.slug === "split-pdf" ? <SplitPdfTool /> : null}
      {tool.slug === "rotate-pdf" ? <RotatePdfTool /> : null}
      {tool.slug === "delete-pdf-pages" ? <DeletePdfPagesTool /> : null}
      {tool.slug === "pdf-to-text" ? <PdfToTextTool /> : null}
      {tool.slug === "add-watermark-pdf" ? <AddWatermarkPdfTool /> : null}
      {tool.slug === "emoji-catalog" ? <EmojiCatalogTool /> : null}
      {tool.slug === "qr-code-generator" ? <QrCodeGeneratorTool /> : null}
      {tool.slug === "company-lookup-navigator" ? <CompanyLookupNavigatorTool /> : null}
      {tool.slug === "roblox-player-lookup" ? <RobloxPlayerLookupTool /> : null}
      {tool.slug === "age-calculator" ? <AgeCalculatorTool /> : null}
      {tool.slug === "pdf-to-jpg" ? <PdfToJpgTool /> : null}
      {tool.slug === "jpg-to-pdf" ? <JpgToPdfTool /> : null}
      {tool.slug === "merge-pdf" ? <MergePdfTool /> : null}
      {tool.slug === "pdf-summarizer" ? <PdfSummarizerTool /> : null}
      {tool.slug === "excel-to-pdf" ? <ExcelToPdfTool /> : null}
      {tool.slug === "hairstyle-try-on" ? <HairstyleTryOnTool /> : null}
      {tool.slug === "days-between-dates" ? <DaysBetweenDatesTool /> : null}
      {tool.slug === "days-from-today" ? <DaysFromTodayTool /> : null}
      {tool.slug === "markup-margin-calculator" ? <MarkupMarginCalculatorTool /> : null}
      {tool.slug === "ib-buying-power-simulator" ? <IbBuyingPowerSimulatorTool /> : null}
      {tool.slug === "time-zone-converter" ? <TimeZoneMeetingPlannerTool /> : null}
      {tool.slug === "id-list-formatter" ? <IdListFormatterTool /> : null}
      {tool.slug === "image-compressor" ? <ImageCompressorTool /> : null}
      {tool.slug === "heic-to-jpg" ? <HeicToJpgTool /> : null}
      {tool.slug === "gif-compressor" ? <GifCompressorTool /> : null}
      {tool.slug === "gif-to-mp4" ? <GifToMp4Tool /> : null}
      {tool.slug === "mp4-to-gif" ? <Mp4ToGifTool /> : null}
      {tool.slug === "webp-to-jpg" ? <WebpToJpgTool /> : null}
      {tool.slug === "remove-background" ? <RemoveBackgroundTool /> : null}
      {tool.slug === "png-to-jpg" ? <PngToJpgTool /> : null}
      {tool.slug === "jpg-to-png" ? <JpgToPngTool /> : null}
      {tool.slug === "image-converter" ? <ImageConverterTool /> : null}
      {tool.slug === "image-mosaic" ? <ImageMosaicTool /> : null}
      {tool.slug === "periodic-table" ? <PeriodicTableTool /> : null}
      {tool.slug === "image-resizer" ? <ImageResizerTool /> : null}
      {tool.slug === "old-photo-restoration" ? <OldPhotoRestorationTool /> : null}
      {tool.slug === "percentage-calculator" ? <PercentageCalculatorTool /> : null}
      {tool.slug === "tip-calculator" ? <TipCalculatorTool /> : null}
      {tool.slug === "loan-payment-calculator" ? <LoanPaymentCalculatorTool /> : null}
      {tool.slug === "paycheck-calculator" ? <PaycheckCalculatorTool /> : null}
      {tool.slug === "time-card-calculator" ? <TimeCardCalculatorTool /> : null}
      {tool.slug === "sales-tax-calculator" ? <SalesTaxCalculatorTool /> : null}
      {tool.slug === "discount-tax-calculator" ? <DiscountTaxCalculatorTool /> : null}
      {tool.slug === "apr-calculator" ? <AprCalculatorTool /> : null}
      {tool.slug === "md5-tool" ? <Md5Tool /> : null}
      {tool.slug === "subscription-waste-finder" ? <SubscriptionWasteFinderTool /> : null}
      {tool.slug === "subscription-downgrade-optimizer" ? <SubscriptionDowngradeOptimizerTool /> : null}
      {tool.slug === "quarterly-tax-safe-pay-planner" ? <QuarterlyTaxSafePayPlannerTool /> : null}
      {tool.slug === "ev-charging-cost-calculator" ? <EvChargingCostCalculatorTool /> : null}
      {tool.slug === "ev-trip-charging-cost-planner" ? (
        <Suspense
          fallback={
            <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
              <p className="text-sm text-muted">Loading trip planner...</p>
            </section>
          }
        >
          <EvTripChargingCostPlannerTool />
        </Suspense>
      ) : null}
      {tool.slug === "currency-converter" ? <CurrencyConverterTool /> : null}
      {tool.slug === "bmi-calculator" ? <BmiCalculatorTool /> : null}
      {tool.slug === "unit-converter" ? <UnitConverterTool /> : null}
      {tool.slug === "remove-line-breaks" ? <RemoveLineBreaksTool /> : null}
      {tool.slug === "tdee-calculator" ? <TdeeCalculatorTool /> : null}
      {tool.slug === "water-intake-calculator" ? <WaterIntakeCalculatorTool /> : null}

      {tool.slug !== "word-counter" &&
      tool.slug !== "character-counter" &&
      tool.slug !== "case-converter" &&
      tool.slug !== "compress-pdf" &&
      tool.slug !== "split-pdf" &&
      tool.slug !== "rotate-pdf" &&
      tool.slug !== "delete-pdf-pages" &&
      tool.slug !== "pdf-to-text" &&
      tool.slug !== "add-watermark-pdf" &&
      tool.slug !== "emoji-catalog" &&
      tool.slug !== "qr-code-generator" &&
      tool.slug !== "company-lookup-navigator" &&
      tool.slug !== "roblox-player-lookup" &&
      tool.slug !== "age-calculator" &&
      tool.slug !== "pdf-to-jpg" &&
      tool.slug !== "jpg-to-pdf" &&
      tool.slug !== "merge-pdf" &&
      tool.slug !== "pdf-summarizer" &&
      tool.slug !== "excel-to-pdf" &&
      tool.slug !== "hairstyle-try-on" &&
      tool.slug !== "days-between-dates" &&
      tool.slug !== "days-from-today" &&
      tool.slug !== "markup-margin-calculator" &&
      tool.slug !== "ib-buying-power-simulator" &&
      tool.slug !== "time-zone-converter" &&
      tool.slug !== "id-list-formatter" &&
      tool.slug !== "image-compressor" &&
      tool.slug !== "heic-to-jpg" &&
      tool.slug !== "gif-compressor" &&
      tool.slug !== "gif-to-mp4" &&
      tool.slug !== "mp4-to-gif" &&
      tool.slug !== "webp-to-jpg" &&
      tool.slug !== "remove-background" &&
      tool.slug !== "png-to-jpg" &&
      tool.slug !== "jpg-to-png" &&
      tool.slug !== "image-converter" &&
      tool.slug !== "image-mosaic" &&
      tool.slug !== "periodic-table" &&
      tool.slug !== "image-resizer" &&
      tool.slug !== "old-photo-restoration" &&
      tool.slug !== "percentage-calculator" &&
      tool.slug !== "tip-calculator" &&
      tool.slug !== "loan-payment-calculator" &&
      tool.slug !== "paycheck-calculator" &&
      tool.slug !== "time-card-calculator" &&
      tool.slug !== "sales-tax-calculator" &&
      tool.slug !== "discount-tax-calculator" &&
      tool.slug !== "apr-calculator" &&
      tool.slug !== "md5-tool" &&
      tool.slug !== "subscription-waste-finder" &&
      tool.slug !== "subscription-downgrade-optimizer" &&
      tool.slug !== "quarterly-tax-safe-pay-planner" &&
      tool.slug !== "ev-charging-cost-calculator" &&
      tool.slug !== "ev-trip-charging-cost-planner" &&
      tool.slug !== "currency-converter" &&
      tool.slug !== "bmi-calculator" &&
      tool.slug !== "unit-converter" &&
      tool.slug !== "remove-line-breaks" &&
      tool.slug !== "tdee-calculator" &&
      tool.slug !== "water-intake-calculator" ? (
        <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Tool Panel</h2>
          <p className="mt-3 text-muted">
            This tool is in template mode. The real calculator or converter logic will be added in
            the next step.
          </p>
          <div className="mt-5 rounded-xl border border-dashed border-line bg-white p-6 text-sm text-muted">
            Input fields, instant result card, and reset/copy actions will live here.
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
          {howItWorks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold">Detailed Guide</h2>
        <div className="mt-4 grid gap-3">
          {usageGuide.map((section) => (
            <article key={section.title} className="rounded-2xl border border-line bg-white p-4">
              <h3 className="text-sm font-semibold text-foreground sm:text-base">{section.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{section.content}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold">Methodology</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted sm:text-base">
          {methodology.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {popularSearches.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Popular Searches</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            People often look for this tool using related search phrases. UsefulKit covers the same
            workflow with a fast browser-based experience.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {popularSearches.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-4 space-y-3">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-line bg-white p-4">
              <h3 className="text-sm font-semibold text-foreground sm:text-base">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {relatedTools.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold">Related Tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((related) => (
              <Link
                key={related.slug}
                href={`/tools/${related.slug}`}
                className="rounded-2xl border border-line bg-white p-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand hover:text-brand"
              >
                {related.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </main>
  );
}
