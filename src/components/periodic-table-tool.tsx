"use client";

import { useMemo, useState } from "react";

type ElementCategory =
  | "alkali metal"
  | "alkaline earth metal"
  | "transition metal"
  | "post-transition metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble gas"
  | "lanthanide"
  | "actinide";

type ElementItem = {
  atomicNumber: number;
  symbol: string;
  name: string;
  group: number;
  period: number;
  category: ElementCategory;
};

const ELEMENTS: ElementItem[] = [
  { atomicNumber: 1, symbol: "H", name: "Hydrogen", group: 1, period: 1, category: "nonmetal" },
  { atomicNumber: 2, symbol: "He", name: "Helium", group: 18, period: 1, category: "noble gas" },
  { atomicNumber: 3, symbol: "Li", name: "Lithium", group: 1, period: 2, category: "alkali metal" },
  { atomicNumber: 4, symbol: "Be", name: "Beryllium", group: 2, period: 2, category: "alkaline earth metal" },
  { atomicNumber: 5, symbol: "B", name: "Boron", group: 13, period: 2, category: "metalloid" },
  { atomicNumber: 6, symbol: "C", name: "Carbon", group: 14, period: 2, category: "nonmetal" },
  { atomicNumber: 7, symbol: "N", name: "Nitrogen", group: 15, period: 2, category: "nonmetal" },
  { atomicNumber: 8, symbol: "O", name: "Oxygen", group: 16, period: 2, category: "nonmetal" },
  { atomicNumber: 9, symbol: "F", name: "Fluorine", group: 17, period: 2, category: "halogen" },
  { atomicNumber: 10, symbol: "Ne", name: "Neon", group: 18, period: 2, category: "noble gas" },
  { atomicNumber: 11, symbol: "Na", name: "Sodium", group: 1, period: 3, category: "alkali metal" },
  { atomicNumber: 12, symbol: "Mg", name: "Magnesium", group: 2, period: 3, category: "alkaline earth metal" },
  { atomicNumber: 13, symbol: "Al", name: "Aluminum", group: 13, period: 3, category: "post-transition metal" },
  { atomicNumber: 14, symbol: "Si", name: "Silicon", group: 14, period: 3, category: "metalloid" },
  { atomicNumber: 15, symbol: "P", name: "Phosphorus", group: 15, period: 3, category: "nonmetal" },
  { atomicNumber: 16, symbol: "S", name: "Sulfur", group: 16, period: 3, category: "nonmetal" },
  { atomicNumber: 17, symbol: "Cl", name: "Chlorine", group: 17, period: 3, category: "halogen" },
  { atomicNumber: 18, symbol: "Ar", name: "Argon", group: 18, period: 3, category: "noble gas" },
  { atomicNumber: 19, symbol: "K", name: "Potassium", group: 1, period: 4, category: "alkali metal" },
  { atomicNumber: 20, symbol: "Ca", name: "Calcium", group: 2, period: 4, category: "alkaline earth metal" },
  { atomicNumber: 21, symbol: "Sc", name: "Scandium", group: 3, period: 4, category: "transition metal" },
  { atomicNumber: 22, symbol: "Ti", name: "Titanium", group: 4, period: 4, category: "transition metal" },
  { atomicNumber: 23, symbol: "V", name: "Vanadium", group: 5, period: 4, category: "transition metal" },
  { atomicNumber: 24, symbol: "Cr", name: "Chromium", group: 6, period: 4, category: "transition metal" },
  { atomicNumber: 25, symbol: "Mn", name: "Manganese", group: 7, period: 4, category: "transition metal" },
  { atomicNumber: 26, symbol: "Fe", name: "Iron", group: 8, period: 4, category: "transition metal" },
  { atomicNumber: 27, symbol: "Co", name: "Cobalt", group: 9, period: 4, category: "transition metal" },
  { atomicNumber: 28, symbol: "Ni", name: "Nickel", group: 10, period: 4, category: "transition metal" },
  { atomicNumber: 29, symbol: "Cu", name: "Copper", group: 11, period: 4, category: "transition metal" },
  { atomicNumber: 30, symbol: "Zn", name: "Zinc", group: 12, period: 4, category: "transition metal" },
  { atomicNumber: 31, symbol: "Ga", name: "Gallium", group: 13, period: 4, category: "post-transition metal" },
  { atomicNumber: 32, symbol: "Ge", name: "Germanium", group: 14, period: 4, category: "metalloid" },
  { atomicNumber: 33, symbol: "As", name: "Arsenic", group: 15, period: 4, category: "metalloid" },
  { atomicNumber: 34, symbol: "Se", name: "Selenium", group: 16, period: 4, category: "nonmetal" },
  { atomicNumber: 35, symbol: "Br", name: "Bromine", group: 17, period: 4, category: "halogen" },
  { atomicNumber: 36, symbol: "Kr", name: "Krypton", group: 18, period: 4, category: "noble gas" },
  { atomicNumber: 37, symbol: "Rb", name: "Rubidium", group: 1, period: 5, category: "alkali metal" },
  { atomicNumber: 38, symbol: "Sr", name: "Strontium", group: 2, period: 5, category: "alkaline earth metal" },
  { atomicNumber: 39, symbol: "Y", name: "Yttrium", group: 3, period: 5, category: "transition metal" },
  { atomicNumber: 40, symbol: "Zr", name: "Zirconium", group: 4, period: 5, category: "transition metal" },
  { atomicNumber: 41, symbol: "Nb", name: "Niobium", group: 5, period: 5, category: "transition metal" },
  { atomicNumber: 42, symbol: "Mo", name: "Molybdenum", group: 6, period: 5, category: "transition metal" },
  { atomicNumber: 43, symbol: "Tc", name: "Technetium", group: 7, period: 5, category: "transition metal" },
  { atomicNumber: 44, symbol: "Ru", name: "Ruthenium", group: 8, period: 5, category: "transition metal" },
  { atomicNumber: 45, symbol: "Rh", name: "Rhodium", group: 9, period: 5, category: "transition metal" },
  { atomicNumber: 46, symbol: "Pd", name: "Palladium", group: 10, period: 5, category: "transition metal" },
  { atomicNumber: 47, symbol: "Ag", name: "Silver", group: 11, period: 5, category: "transition metal" },
  { atomicNumber: 48, symbol: "Cd", name: "Cadmium", group: 12, period: 5, category: "transition metal" },
  { atomicNumber: 49, symbol: "In", name: "Indium", group: 13, period: 5, category: "post-transition metal" },
  { atomicNumber: 50, symbol: "Sn", name: "Tin", group: 14, period: 5, category: "post-transition metal" },
  { atomicNumber: 51, symbol: "Sb", name: "Antimony", group: 15, period: 5, category: "metalloid" },
  { atomicNumber: 52, symbol: "Te", name: "Tellurium", group: 16, period: 5, category: "metalloid" },
  { atomicNumber: 53, symbol: "I", name: "Iodine", group: 17, period: 5, category: "halogen" },
  { atomicNumber: 54, symbol: "Xe", name: "Xenon", group: 18, period: 5, category: "noble gas" },
  { atomicNumber: 55, symbol: "Cs", name: "Cesium", group: 1, period: 6, category: "alkali metal" },
  { atomicNumber: 56, symbol: "Ba", name: "Barium", group: 2, period: 6, category: "alkaline earth metal" },
  { atomicNumber: 57, symbol: "La", name: "Lanthanum", group: 3, period: 6, category: "lanthanide" },
  { atomicNumber: 58, symbol: "Ce", name: "Cerium", group: 4, period: 8, category: "lanthanide" },
  { atomicNumber: 59, symbol: "Pr", name: "Praseodymium", group: 5, period: 8, category: "lanthanide" },
  { atomicNumber: 60, symbol: "Nd", name: "Neodymium", group: 6, period: 8, category: "lanthanide" },
  { atomicNumber: 61, symbol: "Pm", name: "Promethium", group: 7, period: 8, category: "lanthanide" },
  { atomicNumber: 62, symbol: "Sm", name: "Samarium", group: 8, period: 8, category: "lanthanide" },
  { atomicNumber: 63, symbol: "Eu", name: "Europium", group: 9, period: 8, category: "lanthanide" },
  { atomicNumber: 64, symbol: "Gd", name: "Gadolinium", group: 10, period: 8, category: "lanthanide" },
  { atomicNumber: 65, symbol: "Tb", name: "Terbium", group: 11, period: 8, category: "lanthanide" },
  { atomicNumber: 66, symbol: "Dy", name: "Dysprosium", group: 12, period: 8, category: "lanthanide" },
  { atomicNumber: 67, symbol: "Ho", name: "Holmium", group: 13, period: 8, category: "lanthanide" },
  { atomicNumber: 68, symbol: "Er", name: "Erbium", group: 14, period: 8, category: "lanthanide" },
  { atomicNumber: 69, symbol: "Tm", name: "Thulium", group: 15, period: 8, category: "lanthanide" },
  { atomicNumber: 70, symbol: "Yb", name: "Ytterbium", group: 16, period: 8, category: "lanthanide" },
  { atomicNumber: 71, symbol: "Lu", name: "Lutetium", group: 17, period: 8, category: "lanthanide" },
  { atomicNumber: 72, symbol: "Hf", name: "Hafnium", group: 4, period: 6, category: "transition metal" },
  { atomicNumber: 73, symbol: "Ta", name: "Tantalum", group: 5, period: 6, category: "transition metal" },
  { atomicNumber: 74, symbol: "W", name: "Tungsten", group: 6, period: 6, category: "transition metal" },
  { atomicNumber: 75, symbol: "Re", name: "Rhenium", group: 7, period: 6, category: "transition metal" },
  { atomicNumber: 76, symbol: "Os", name: "Osmium", group: 8, period: 6, category: "transition metal" },
  { atomicNumber: 77, symbol: "Ir", name: "Iridium", group: 9, period: 6, category: "transition metal" },
  { atomicNumber: 78, symbol: "Pt", name: "Platinum", group: 10, period: 6, category: "transition metal" },
  { atomicNumber: 79, symbol: "Au", name: "Gold", group: 11, period: 6, category: "transition metal" },
  { atomicNumber: 80, symbol: "Hg", name: "Mercury", group: 12, period: 6, category: "transition metal" },
  { atomicNumber: 81, symbol: "Tl", name: "Thallium", group: 13, period: 6, category: "post-transition metal" },
  { atomicNumber: 82, symbol: "Pb", name: "Lead", group: 14, period: 6, category: "post-transition metal" },
  { atomicNumber: 83, symbol: "Bi", name: "Bismuth", group: 15, period: 6, category: "post-transition metal" },
  { atomicNumber: 84, symbol: "Po", name: "Polonium", group: 16, period: 6, category: "metalloid" },
  { atomicNumber: 85, symbol: "At", name: "Astatine", group: 17, period: 6, category: "halogen" },
  { atomicNumber: 86, symbol: "Rn", name: "Radon", group: 18, period: 6, category: "noble gas" },
  { atomicNumber: 87, symbol: "Fr", name: "Francium", group: 1, period: 7, category: "alkali metal" },
  { atomicNumber: 88, symbol: "Ra", name: "Radium", group: 2, period: 7, category: "alkaline earth metal" },
  { atomicNumber: 89, symbol: "Ac", name: "Actinium", group: 3, period: 7, category: "actinide" },
  { atomicNumber: 90, symbol: "Th", name: "Thorium", group: 4, period: 9, category: "actinide" },
  { atomicNumber: 91, symbol: "Pa", name: "Protactinium", group: 5, period: 9, category: "actinide" },
  { atomicNumber: 92, symbol: "U", name: "Uranium", group: 6, period: 9, category: "actinide" },
  { atomicNumber: 93, symbol: "Np", name: "Neptunium", group: 7, period: 9, category: "actinide" },
  { atomicNumber: 94, symbol: "Pu", name: "Plutonium", group: 8, period: 9, category: "actinide" },
  { atomicNumber: 95, symbol: "Am", name: "Americium", group: 9, period: 9, category: "actinide" },
  { atomicNumber: 96, symbol: "Cm", name: "Curium", group: 10, period: 9, category: "actinide" },
  { atomicNumber: 97, symbol: "Bk", name: "Berkelium", group: 11, period: 9, category: "actinide" },
  { atomicNumber: 98, symbol: "Cf", name: "Californium", group: 12, period: 9, category: "actinide" },
  { atomicNumber: 99, symbol: "Es", name: "Einsteinium", group: 13, period: 9, category: "actinide" },
  { atomicNumber: 100, symbol: "Fm", name: "Fermium", group: 14, period: 9, category: "actinide" },
  { atomicNumber: 101, symbol: "Md", name: "Mendelevium", group: 15, period: 9, category: "actinide" },
  { atomicNumber: 102, symbol: "No", name: "Nobelium", group: 16, period: 9, category: "actinide" },
  { atomicNumber: 103, symbol: "Lr", name: "Lawrencium", group: 17, period: 9, category: "actinide" },
  { atomicNumber: 104, symbol: "Rf", name: "Rutherfordium", group: 4, period: 7, category: "transition metal" },
  { atomicNumber: 105, symbol: "Db", name: "Dubnium", group: 5, period: 7, category: "transition metal" },
  { atomicNumber: 106, symbol: "Sg", name: "Seaborgium", group: 6, period: 7, category: "transition metal" },
  { atomicNumber: 107, symbol: "Bh", name: "Bohrium", group: 7, period: 7, category: "transition metal" },
  { atomicNumber: 108, symbol: "Hs", name: "Hassium", group: 8, period: 7, category: "transition metal" },
  { atomicNumber: 109, symbol: "Mt", name: "Meitnerium", group: 9, period: 7, category: "transition metal" },
  { atomicNumber: 110, symbol: "Ds", name: "Darmstadtium", group: 10, period: 7, category: "transition metal" },
  { atomicNumber: 111, symbol: "Rg", name: "Roentgenium", group: 11, period: 7, category: "transition metal" },
  { atomicNumber: 112, symbol: "Cn", name: "Copernicium", group: 12, period: 7, category: "transition metal" },
  { atomicNumber: 113, symbol: "Nh", name: "Nihonium", group: 13, period: 7, category: "post-transition metal" },
  { atomicNumber: 114, symbol: "Fl", name: "Flerovium", group: 14, period: 7, category: "post-transition metal" },
  { atomicNumber: 115, symbol: "Mc", name: "Moscovium", group: 15, period: 7, category: "post-transition metal" },
  { atomicNumber: 116, symbol: "Lv", name: "Livermorium", group: 16, period: 7, category: "post-transition metal" },
  { atomicNumber: 117, symbol: "Ts", name: "Tennessine", group: 17, period: 7, category: "halogen" },
  { atomicNumber: 118, symbol: "Og", name: "Oganesson", group: 18, period: 7, category: "noble gas" },
];

const CATEGORY_ORDER: ElementCategory[] = [
  "alkali metal",
  "alkaline earth metal",
  "transition metal",
  "post-transition metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble gas",
  "lanthanide",
  "actinide",
];

const CATEGORY_COLOR: Record<ElementCategory, string> = {
  "alkali metal": "bg-rose-100 text-rose-900 border-rose-300",
  "alkaline earth metal": "bg-orange-100 text-orange-900 border-orange-300",
  "transition metal": "bg-amber-100 text-amber-900 border-amber-300",
  "post-transition metal": "bg-lime-100 text-lime-900 border-lime-300",
  metalloid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  nonmetal: "bg-sky-100 text-sky-900 border-sky-300",
  halogen: "bg-indigo-100 text-indigo-900 border-indigo-300",
  "noble gas": "bg-violet-100 text-violet-900 border-violet-300",
  lanthanide: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300",
  actinide: "bg-pink-100 text-pink-900 border-pink-300",
};

function matchesQuery(element: ElementItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    element.name.toLowerCase().includes(q) ||
    element.symbol.toLowerCase().includes(q) ||
    String(element.atomicNumber) === q
  );
}

export function PeriodicTableTool() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ElementCategory | "all">("all");
  const [selectedAtomicNumber, setSelectedAtomicNumber] = useState(1);

  const selectedElement =
    ELEMENTS.find((item) => item.atomicNumber === selectedAtomicNumber) ?? ELEMENTS[0];

  const visibleSet = useMemo(() => {
    const ids = new Set<number>();
    for (const element of ELEMENTS) {
      const categoryPass = activeCategory === "all" || element.category === activeCategory;
      const queryPass = matchesQuery(element, query);
      if (categoryPass && queryPass) {
        ids.add(element.atomicNumber);
      }
    }
    return ids;
  }, [activeCategory, query]);

  const matchedCount = visibleSet.size;
  const lanthanides = ELEMENTS.filter((item) => item.period === 8);
  const actinides = ELEMENTS.filter((item) => item.period === 9);

  return (
    <section className="mt-8 grid gap-4">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Periodic Table</h2>
        <p className="mt-2 text-sm text-muted">
          Search elements by name, symbol, or atomic number and filter by element families.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Search Element</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Fe, Oxygen, 79"
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              activeCategory === "all"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            All
          </button>
          {CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                activeCategory === category
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <article className="mt-5 rounded-2xl border border-line bg-white p-3">
          <div
            className="grid gap-1 overflow-x-auto pb-2"
            style={{ gridTemplateColumns: "repeat(18, minmax(44px, 1fr))" }}
          >
            {ELEMENTS.filter((item) => item.period <= 7).map((item) => {
              const visible = visibleSet.has(item.atomicNumber);
              return (
                <button
                  key={item.atomicNumber}
                  type="button"
                  onClick={() => setSelectedAtomicNumber(item.atomicNumber)}
                  className={`rounded border p-1 text-left transition ${CATEGORY_COLOR[item.category]} ${
                    selectedAtomicNumber === item.atomicNumber ? "ring-2 ring-brand" : ""
                  } ${visible ? "opacity-100" : "opacity-25"}`}
                  style={{ gridColumn: item.group, gridRow: item.period }}
                  title={`${item.name} (${item.symbol})`}
                >
                  <p className="text-[10px] font-semibold leading-tight">{item.atomicNumber}</p>
                  <p className="text-sm font-bold leading-tight">{item.symbol}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Lanthanides</div>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
              {lanthanides.map((item) => {
                const visible = visibleSet.has(item.atomicNumber);
                return (
                  <button
                    key={item.atomicNumber}
                    type="button"
                    onClick={() => setSelectedAtomicNumber(item.atomicNumber)}
                    className={`rounded border p-1 text-left transition ${CATEGORY_COLOR[item.category]} ${
                      selectedAtomicNumber === item.atomicNumber ? "ring-2 ring-brand" : ""
                    } ${visible ? "opacity-100" : "opacity-25"}`}
                    title={`${item.name} (${item.symbol})`}
                  >
                    <p className="text-[10px] font-semibold leading-tight">{item.atomicNumber}</p>
                    <p className="text-sm font-bold leading-tight">{item.symbol}</p>
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Actinides</div>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
              {actinides.map((item) => {
                const visible = visibleSet.has(item.atomicNumber);
                return (
                  <button
                    key={item.atomicNumber}
                    type="button"
                    onClick={() => setSelectedAtomicNumber(item.atomicNumber)}
                    className={`rounded border p-1 text-left transition ${CATEGORY_COLOR[item.category]} ${
                      selectedAtomicNumber === item.atomicNumber ? "ring-2 ring-brand" : ""
                    } ${visible ? "opacity-100" : "opacity-25"}`}
                    title={`${item.name} (${item.symbol})`}
                  >
                    <p className="text-[10px] font-semibold leading-tight">{item.atomicNumber}</p>
                    <p className="text-sm font-bold leading-tight">{item.symbol}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </article>
        <p className="mt-4 text-xs text-muted">
          Tip: click any element tile to open details below.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Matched Elements</p>
          <p className="mt-2 text-3xl font-bold">{matchedCount}</p>
          <p className="mt-1 text-xs text-muted">Filtered by current search and category.</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selected Element Details</p>
          <p className="mt-2 text-2xl font-bold">
            {selectedElement.symbol} - {selectedElement.name}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>Atomic Number: {selectedElement.atomicNumber}</li>
            <li>Group: {selectedElement.group}</li>
            <li>Period: {selectedElement.period > 7 ? selectedElement.period - 1 : selectedElement.period}</li>
            <li>Family: {selectedElement.category}</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
