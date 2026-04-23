export type ToolCategory =
  | "file-tools"
  | "text-tools"
  | "date-time"
  | "converters"
  | "health";

export type ToolItem = {
  slug: string;
  name: string;
  summary: string;
  category: ToolCategory;
  keyword: string;
};

export const categoryLabels: Record<ToolCategory, string> = {
  "file-tools": "File Tools",
  "text-tools": "Text Tools",
  "date-time": "Date & Time",
  converters: "Converters",
  health: "Health",
};

export const tools: ToolItem[] = [
  {
    slug: "image-compressor",
    name: "Image Compressor",
    summary: "Compress JPG, PNG, and WebP files in seconds.",
    category: "file-tools",
    keyword: "image compressor",
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    summary: "Upload once and convert to JPG, PNG, or WebP instantly.",
    category: "file-tools",
    keyword: "image converter",
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    summary: "Resize by dimensions or target size for social and web.",
    category: "file-tools",
    keyword: "image resizer",
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG",
    summary: "Convert PNG files to JPG with custom quality and background color.",
    category: "file-tools",
    keyword: "png to jpg",
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG",
    summary: "Convert JPG images to PNG format in your browser.",
    category: "file-tools",
    keyword: "jpg to png",
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    summary: "Convert PDF pages into high-quality JPG images.",
    category: "file-tools",
    keyword: "pdf to jpg",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    summary: "Combine multiple PDF files into one document.",
    category: "file-tools",
    keyword: "merge pdf",
  },
  {
    slug: "pdf-summarizer",
    name: "PDF Summarizer",
    summary: "Upload a PDF and generate a fast summary with key points.",
    category: "file-tools",
    keyword: "pdf summarizer",
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    summary: "Convert .xlsx or .csv sheets into paginated PDF files in your browser.",
    category: "file-tools",
    keyword: "excel to pdf",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    summary: "Count words, characters, and reading time instantly.",
    category: "text-tools",
    keyword: "word counter",
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    summary: "Fast character count for posts, ads, and forms.",
    category: "text-tools",
    keyword: "character counter",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    summary: "Switch to lower, upper, title, or sentence case.",
    category: "text-tools",
    keyword: "case converter",
  },
  {
    slug: "remove-line-breaks",
    name: "Remove Line Breaks",
    summary: "Clean pasted text and remove extra line breaks quickly.",
    category: "text-tools",
    keyword: "remove line breaks",
  },
  {
    slug: "id-list-formatter",
    name: "ID List Formatter",
    summary: "Append commas or custom suffix symbols to IDs line by line.",
    category: "text-tools",
    keyword: "id list formatter",
  },
  {
    slug: "md5-tool",
    name: "MD5 Tool",
    summary: "Generate and verify MD5 hashes for text inputs.",
    category: "text-tools",
    keyword: "md5 generator",
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    summary: "Calculate exact age from a date of birth.",
    category: "date-time",
    keyword: "age calculator",
  },
  {
    slug: "days-between-dates",
    name: "Days Between Dates",
    summary: "Find the exact number of days between any two dates.",
    category: "date-time",
    keyword: "days between dates",
  },
  {
    slug: "days-from-today",
    name: "Days From Today Calculator",
    summary: "Add or subtract calendar or business days from any date instantly.",
    category: "date-time",
    keyword: "days from today",
  },
  {
    slug: "time-zone-converter",
    name: "Time Zone Meeting Planner",
    summary: "Find overlap meeting windows across U.S. and global time zones.",
    category: "date-time",
    keyword: "time zone meeting planner",
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    summary: "Convert length, weight, temperature, and area units.",
    category: "converters",
    keyword: "unit converter",
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    summary: "Calculate percentages, increase, and decrease easily.",
    category: "converters",
    keyword: "percentage calculator",
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    summary: "Split bills and calculate tip by percentage.",
    category: "converters",
    keyword: "tip calculator",
  },
  {
    slug: "loan-payment-calculator",
    name: "Loan Payment Calculator",
    summary: "Estimate monthly payment, total interest, and total repayment.",
    category: "converters",
    keyword: "loan payment calculator",
  },
  {
    slug: "paycheck-calculator",
    name: "Paycheck Calculator",
    summary: "Estimate gross pay, taxes, and take-home pay for each paycheck.",
    category: "converters",
    keyword: "paycheck calculator",
  },
  {
    slug: "sales-tax-calculator",
    name: "Sales Tax Calculator",
    summary: "Calculate tax amount, pre-tax price, and final total in seconds.",
    category: "converters",
    keyword: "sales tax calculator",
  },
  {
    slug: "discount-tax-calculator",
    name: "Discount + Tax Calculator",
    summary: "Apply discount first, then calculate sales tax and final checkout total.",
    category: "converters",
    keyword: "discount tax calculator",
  },
  {
    slug: "apr-calculator",
    name: "APR Calculator",
    summary: "Estimate annual percentage rate or monthly payment for a fixed-term loan.",
    category: "converters",
    keyword: "apr calculator",
  },
  {
    slug: "subscription-waste-finder",
    name: "Subscription Waste Finder",
    summary: "Upload CSV and detect recurring charges, duplicates, and possible wasted spend.",
    category: "converters",
    keyword: "subscription waste finder",
  },
  {
    slug: "subscription-downgrade-optimizer",
    name: "Subscription Downgrade Optimizer",
    summary: "Model ad tiers, annual plans, and bundles to cut recurring subscription costs.",
    category: "converters",
    keyword: "subscription downgrade optimizer",
  },
  {
    slug: "quarterly-tax-safe-pay-planner",
    name: "Quarterly Tax Safe-Pay Planner",
    summary: "Estimate quarterly tax payments and due-date targets for freelancers and side income.",
    category: "converters",
    keyword: "quarterly tax planner",
  },
  {
    slug: "ev-charging-cost-calculator",
    name: "EV Charging Cost Calculator",
    summary: "Estimate EV charging costs by U.S. state with home/public mix and gas comparison.",
    category: "converters",
    keyword: "ev charging cost calculator",
  },
  {
    slug: "ev-trip-charging-cost-planner",
    name: "EV Trip Charging Cost Planner",
    summary: "Estimate charging stops, charging time, and trip cost for long-distance EV travel.",
    category: "converters",
    keyword: "ev trip charging cost planner",
  },
  {
    slug: "markup-margin-calculator",
    name: "Markup & Margin Calculator",
    summary: "Calculate selling price, markup, margin, and profit from cost data.",
    category: "converters",
    keyword: "markup margin calculator",
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    summary: "Convert between USD, EUR, GBP, CAD, AUD, JPY, and CNY.",
    category: "converters",
    keyword: "currency converter",
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    summary: "Estimate body mass index using height and weight.",
    category: "health",
    keyword: "bmi calculator",
  },
  {
    slug: "tdee-calculator",
    name: "TDEE Calculator",
    summary: "Estimate daily calories based on activity level.",
    category: "health",
    keyword: "tdee calculator",
  },
  {
    slug: "water-intake-calculator",
    name: "Water Intake Calculator",
    summary: "Estimate daily water needs in cups or liters.",
    category: "health",
    keyword: "water intake calculator",
  },
];

export const categoryOrder: ToolCategory[] = [
  "file-tools",
  "text-tools",
  "date-time",
  "converters",
  "health",
];

export function getToolBySlug(slug: string): ToolItem | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolItem[] {
  return tools.filter((tool) => tool.category === category);
}
