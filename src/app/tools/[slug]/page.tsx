import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AgeCalculatorTool } from "@/components/age-calculator-tool";
import { AprCalculatorTool } from "@/components/apr-calculator-tool";
import { BmiCalculatorTool } from "@/components/bmi-calculator-tool";
import { CaseConverterTool } from "@/components/case-converter-tool";
import { CharacterCounterTool } from "@/components/character-counter-tool";
import { CurrencyConverterTool } from "@/components/currency-converter-tool";
import { DaysBetweenDatesTool } from "@/components/days-between-dates-tool";
import { DiscountTaxCalculatorTool } from "@/components/discount-tax-calculator-tool";
import { ExcelToPdfTool } from "@/components/excel-to-pdf-tool";
import { EvChargingCostCalculatorTool } from "@/components/ev-charging-cost-calculator-tool";
import { EvTripChargingCostPlannerTool } from "@/components/ev-trip-charging-cost-planner-tool";
import { IdListFormatterTool } from "@/components/id-list-formatter-tool";
import { ImageCompressorTool } from "@/components/image-compressor-tool";
import { ImageConverterTool } from "@/components/image-converter-tool";
import { ImageResizerTool } from "@/components/image-resizer-tool";
import { JpgToPngTool } from "@/components/jpg-to-png-tool";
import { LoanPaymentCalculatorTool } from "@/components/loan-payment-calculator-tool";
import { Md5Tool } from "@/components/md5-tool";
import { MarkupMarginCalculatorTool } from "@/components/markup-margin-calculator-tool";
import { MergePdfTool } from "@/components/merge-pdf-tool";
import { PercentageCalculatorTool } from "@/components/percentage-calculator-tool";
import { PdfToJpgTool } from "@/components/pdf-to-jpg-tool";
import { PdfSummarizerTool } from "@/components/pdf-summarizer-tool";
import { PngToJpgTool } from "@/components/png-to-jpg-tool";
import { QuarterlyTaxSafePayPlannerTool } from "@/components/quarterly-tax-safe-pay-planner-tool";
import { RemoveLineBreaksTool } from "@/components/remove-line-breaks-tool";
import { SalesTaxCalculatorTool } from "@/components/sales-tax-calculator-tool";
import { SubscriptionDowngradeOptimizerTool } from "@/components/subscription-downgrade-optimizer-tool";
import { SubscriptionWasteFinderTool } from "@/components/subscription-waste-finder-tool";
import { TdeeCalculatorTool } from "@/components/tdee-calculator-tool";
import { TimeZoneMeetingPlannerTool } from "@/components/time-zone-meeting-planner-tool";
import { TipCalculatorTool } from "@/components/tip-calculator-tool";
import { UnitConverterTool } from "@/components/unit-converter-tool";
import { WaterIntakeCalculatorTool } from "@/components/water-intake-calculator-tool";
import { WordCounterTool } from "@/components/word-counter-tool";
import { categoryLabels, getToolBySlug, getToolsByCategory, tools } from "@/lib/tools";

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
  const seoDescription = `${tool.summary} Free online ${tool.name.toLowerCase()} with instant results.`;
  const keywords = [
    tool.keyword,
    tool.name.toLowerCase(),
    `${tool.name.toLowerCase()} online`,
    `free ${tool.keyword}`,
    `${categoryName.toLowerCase()} tool`,
    "usefulkit",
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

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  const relatedTools = getToolsByCategory(tool.category).filter((item) => item.slug !== tool.slug);
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is this ${tool.name.toLowerCase()} free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. UsefulKit offers ${tool.name} for free with no signup required.`,
        },
      },
      {
        "@type": "Question",
        name: "Can I use it on mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. UsefulKit tools are designed to work on desktop and mobile browsers.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate are the results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Results are based on transparent formulas or deterministic processing steps.",
        },
      },
    ],
  };

  const softwareAppData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://usefulkit.io/tools/${tool.slug}`,
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
        : tool.slug === "days-between-dates"
          ? [
              "Select start and end dates.",
              "Toggle whether to include boundary dates.",
              "Get total days and week-plus-day breakdown.",
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
                    : tool.slug === "image-resizer"
                      ? [
                          "Upload an image and set width and height.",
                          "Use custom size or quick social presets.",
                          "Resize and download instantly.",
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

      {tool.slug === "word-counter" ? <WordCounterTool /> : null}
      {tool.slug === "character-counter" ? <CharacterCounterTool /> : null}
      {tool.slug === "case-converter" ? <CaseConverterTool /> : null}
      {tool.slug === "age-calculator" ? <AgeCalculatorTool /> : null}
      {tool.slug === "pdf-to-jpg" ? <PdfToJpgTool /> : null}
      {tool.slug === "merge-pdf" ? <MergePdfTool /> : null}
      {tool.slug === "pdf-summarizer" ? <PdfSummarizerTool /> : null}
      {tool.slug === "excel-to-pdf" ? <ExcelToPdfTool /> : null}
      {tool.slug === "days-between-dates" ? <DaysBetweenDatesTool /> : null}
      {tool.slug === "markup-margin-calculator" ? <MarkupMarginCalculatorTool /> : null}
      {tool.slug === "time-zone-converter" ? <TimeZoneMeetingPlannerTool /> : null}
      {tool.slug === "id-list-formatter" ? <IdListFormatterTool /> : null}
      {tool.slug === "image-compressor" ? <ImageCompressorTool /> : null}
      {tool.slug === "png-to-jpg" ? <PngToJpgTool /> : null}
      {tool.slug === "jpg-to-png" ? <JpgToPngTool /> : null}
      {tool.slug === "image-converter" ? <ImageConverterTool /> : null}
      {tool.slug === "image-resizer" ? <ImageResizerTool /> : null}
      {tool.slug === "percentage-calculator" ? <PercentageCalculatorTool /> : null}
      {tool.slug === "tip-calculator" ? <TipCalculatorTool /> : null}
      {tool.slug === "loan-payment-calculator" ? <LoanPaymentCalculatorTool /> : null}
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
      tool.slug !== "age-calculator" &&
      tool.slug !== "pdf-to-jpg" &&
      tool.slug !== "merge-pdf" &&
      tool.slug !== "pdf-summarizer" &&
      tool.slug !== "excel-to-pdf" &&
      tool.slug !== "days-between-dates" &&
      tool.slug !== "markup-margin-calculator" &&
      tool.slug !== "time-zone-converter" &&
      tool.slug !== "id-list-formatter" &&
      tool.slug !== "image-compressor" &&
      tool.slug !== "png-to-jpg" &&
      tool.slug !== "jpg-to-png" &&
      tool.slug !== "image-converter" &&
      tool.slug !== "image-resizer" &&
      tool.slug !== "percentage-calculator" &&
      tool.slug !== "tip-calculator" &&
      tool.slug !== "loan-payment-calculator" &&
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
    </main>
  );
}
