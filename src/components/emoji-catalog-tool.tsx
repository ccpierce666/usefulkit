"use client";

import { useMemo, useState } from "react";

type EmojiCategoryId =
  | "smileys"
  | "people"
  | "animals"
  | "food"
  | "travel"
  | "objects"
  | "symbols"
  | "flags";

type EmojiItem = {
  emoji: string;
  name: string;
  keywords: string[];
};

type EmojiCategory = {
  id: EmojiCategoryId;
  label: string;
  items: EmojiItem[];
};

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "smileys",
    label: "Smileys",
    items: [
      { emoji: "😀", name: "Grinning Face", keywords: ["happy", "smile"] },
      { emoji: "😃", name: "Grinning Face With Big Eyes", keywords: ["smile", "joy"] },
      { emoji: "😄", name: "Grinning Face With Smiling Eyes", keywords: ["cheerful"] },
      { emoji: "😁", name: "Beaming Face With Smiling Eyes", keywords: ["grin"] },
      { emoji: "😆", name: "Grinning Squinting Face", keywords: ["laugh"] },
      { emoji: "😅", name: "Grinning Face With Sweat", keywords: ["nervous", "relief"] },
      { emoji: "🤣", name: "Rolling On The Floor Laughing", keywords: ["lol", "rofl"] },
      { emoji: "😂", name: "Face With Tears Of Joy", keywords: ["funny", "haha"] },
      { emoji: "🙂", name: "Slightly Smiling Face", keywords: ["smile", "mild"] },
      { emoji: "🙃", name: "Upside-Down Face", keywords: ["sarcasm"] },
      { emoji: "😉", name: "Winking Face", keywords: ["wink"] },
      { emoji: "😊", name: "Smiling Face With Smiling Eyes", keywords: ["blush"] },
      { emoji: "😍", name: "Smiling Face With Heart-Eyes", keywords: ["love"] },
      { emoji: "😘", name: "Face Blowing A Kiss", keywords: ["kiss"] },
      { emoji: "😗", name: "Kissing Face", keywords: ["kiss"] },
      { emoji: "😙", name: "Kissing Face With Smiling Eyes", keywords: ["kiss"] },
      { emoji: "😚", name: "Kissing Face With Closed Eyes", keywords: ["kiss"] },
      { emoji: "😋", name: "Face Savoring Food", keywords: ["yummy"] },
      { emoji: "😛", name: "Face With Tongue", keywords: ["playful"] },
      { emoji: "😜", name: "Winking Face With Tongue", keywords: ["joke"] },
      { emoji: "🤪", name: "Zany Face", keywords: ["crazy"] },
      { emoji: "🤨", name: "Face With Raised Eyebrow", keywords: ["skeptical"] },
      { emoji: "🧐", name: "Face With Monocle", keywords: ["inspect"] },
      { emoji: "😎", name: "Smiling Face With Sunglasses", keywords: ["cool"] },
      { emoji: "🤩", name: "Star-Struck", keywords: ["amazed"] },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { emoji: "👋", name: "Waving Hand", keywords: ["hello", "bye"] },
      { emoji: "🤚", name: "Raised Back Of Hand", keywords: ["hand"] },
      { emoji: "🖐️", name: "Hand With Fingers Splayed", keywords: ["hand"] },
      { emoji: "✋", name: "Raised Hand", keywords: ["stop"] },
      { emoji: "🖖", name: "Vulcan Salute", keywords: ["spock"] },
      { emoji: "👌", name: "OK Hand", keywords: ["ok"] },
      { emoji: "🤌", name: "Pinched Fingers", keywords: ["italian"] },
      { emoji: "🤏", name: "Pinching Hand", keywords: ["small"] },
      { emoji: "✌️", name: "Victory Hand", keywords: ["peace"] },
      { emoji: "🤞", name: "Crossed Fingers", keywords: ["luck"] },
      { emoji: "🤟", name: "Love-You Gesture", keywords: ["ily"] },
      { emoji: "🤘", name: "Sign Of The Horns", keywords: ["rock"] },
      { emoji: "🤙", name: "Call Me Hand", keywords: ["phone"] },
      { emoji: "👈", name: "Backhand Index Pointing Left", keywords: ["left"] },
      { emoji: "👉", name: "Backhand Index Pointing Right", keywords: ["right"] },
      { emoji: "👆", name: "Backhand Index Pointing Up", keywords: ["up"] },
      { emoji: "👇", name: "Backhand Index Pointing Down", keywords: ["down"] },
      { emoji: "👍", name: "Thumbs Up", keywords: ["like"] },
      { emoji: "👎", name: "Thumbs Down", keywords: ["dislike"] },
      { emoji: "👏", name: "Clapping Hands", keywords: ["applause"] },
      { emoji: "🙌", name: "Raising Hands", keywords: ["celebrate"] },
      { emoji: "🫶", name: "Heart Hands", keywords: ["love"] },
      { emoji: "🙏", name: "Folded Hands", keywords: ["pray", "thanks"] },
      { emoji: "💪", name: "Flexed Biceps", keywords: ["strong"] },
      { emoji: "🧠", name: "Brain", keywords: ["smart"] },
    ],
  },
  {
    id: "animals",
    label: "Animals",
    items: [
      { emoji: "🐶", name: "Dog Face", keywords: ["pet"] },
      { emoji: "🐱", name: "Cat Face", keywords: ["pet"] },
      { emoji: "🐭", name: "Mouse Face", keywords: ["animal"] },
      { emoji: "🐹", name: "Hamster Face", keywords: ["pet"] },
      { emoji: "🐰", name: "Rabbit Face", keywords: ["bunny"] },
      { emoji: "🦊", name: "Fox Face", keywords: ["animal"] },
      { emoji: "🐻", name: "Bear", keywords: ["animal"] },
      { emoji: "🐼", name: "Panda", keywords: ["animal"] },
      { emoji: "🐨", name: "Koala", keywords: ["animal"] },
      { emoji: "🐯", name: "Tiger Face", keywords: ["animal"] },
      { emoji: "🦁", name: "Lion", keywords: ["animal"] },
      { emoji: "🐮", name: "Cow Face", keywords: ["farm"] },
      { emoji: "🐷", name: "Pig Face", keywords: ["farm"] },
      { emoji: "🐸", name: "Frog", keywords: ["animal"] },
      { emoji: "🐵", name: "Monkey Face", keywords: ["animal"] },
      { emoji: "🙈", name: "See-No-Evil Monkey", keywords: ["monkey"] },
      { emoji: "🙉", name: "Hear-No-Evil Monkey", keywords: ["monkey"] },
      { emoji: "🙊", name: "Speak-No-Evil Monkey", keywords: ["monkey"] },
      { emoji: "🐔", name: "Chicken", keywords: ["bird"] },
      { emoji: "🐧", name: "Penguin", keywords: ["bird"] },
      { emoji: "🐦", name: "Bird", keywords: ["animal"] },
      { emoji: "🐤", name: "Baby Chick", keywords: ["bird"] },
      { emoji: "🦆", name: "Duck", keywords: ["bird"] },
      { emoji: "🦉", name: "Owl", keywords: ["bird"] },
      { emoji: "🦄", name: "Unicorn", keywords: ["myth"] },
    ],
  },
  {
    id: "food",
    label: "Food",
    items: [
      { emoji: "🍏", name: "Green Apple", keywords: ["fruit"] },
      { emoji: "🍎", name: "Red Apple", keywords: ["fruit"] },
      { emoji: "🍐", name: "Pear", keywords: ["fruit"] },
      { emoji: "🍊", name: "Tangerine", keywords: ["fruit"] },
      { emoji: "🍋", name: "Lemon", keywords: ["fruit"] },
      { emoji: "🍌", name: "Banana", keywords: ["fruit"] },
      { emoji: "🍉", name: "Watermelon", keywords: ["fruit"] },
      { emoji: "🍇", name: "Grapes", keywords: ["fruit"] },
      { emoji: "🍓", name: "Strawberry", keywords: ["fruit"] },
      { emoji: "🫐", name: "Blueberries", keywords: ["fruit"] },
      { emoji: "🍒", name: "Cherries", keywords: ["fruit"] },
      { emoji: "🥑", name: "Avocado", keywords: ["food"] },
      { emoji: "🍕", name: "Pizza", keywords: ["food"] },
      { emoji: "🍔", name: "Hamburger", keywords: ["food"] },
      { emoji: "🍟", name: "French Fries", keywords: ["food"] },
      { emoji: "🌭", name: "Hot Dog", keywords: ["food"] },
      { emoji: "🌮", name: "Taco", keywords: ["food"] },
      { emoji: "🌯", name: "Burrito", keywords: ["food"] },
      { emoji: "🍣", name: "Sushi", keywords: ["food"] },
      { emoji: "🍜", name: "Steaming Bowl", keywords: ["ramen"] },
      { emoji: "🍩", name: "Doughnut", keywords: ["dessert"] },
      { emoji: "🧁", name: "Cupcake", keywords: ["dessert"] },
      { emoji: "🍪", name: "Cookie", keywords: ["dessert"] },
      { emoji: "☕", name: "Hot Beverage", keywords: ["coffee"] },
      { emoji: "🥤", name: "Cup With Straw", keywords: ["drink"] },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    items: [
      { emoji: "🚗", name: "Automobile", keywords: ["car"] },
      { emoji: "🚕", name: "Taxi", keywords: ["car"] },
      { emoji: "🚌", name: "Bus", keywords: ["vehicle"] },
      { emoji: "🚎", name: "Trolleybus", keywords: ["vehicle"] },
      { emoji: "🏎️", name: "Racing Car", keywords: ["car"] },
      { emoji: "🚓", name: "Police Car", keywords: ["vehicle"] },
      { emoji: "🚑", name: "Ambulance", keywords: ["vehicle"] },
      { emoji: "🚒", name: "Fire Engine", keywords: ["vehicle"] },
      { emoji: "🚚", name: "Delivery Truck", keywords: ["vehicle"] },
      { emoji: "🚲", name: "Bicycle", keywords: ["bike"] },
      { emoji: "🛴", name: "Kick Scooter", keywords: ["scooter"] },
      { emoji: "🛵", name: "Motor Scooter", keywords: ["scooter"] },
      { emoji: "🏍️", name: "Motorcycle", keywords: ["bike"] },
      { emoji: "✈️", name: "Airplane", keywords: ["flight"] },
      { emoji: "🛫", name: "Airplane Departure", keywords: ["airport"] },
      { emoji: "🛬", name: "Airplane Arrival", keywords: ["airport"] },
      { emoji: "🚆", name: "Train", keywords: ["rail"] },
      { emoji: "🚄", name: "High-Speed Train", keywords: ["rail"] },
      { emoji: "🚢", name: "Ship", keywords: ["boat"] },
      { emoji: "⛽", name: "Fuel Pump", keywords: ["gas"] },
      { emoji: "🗺️", name: "World Map", keywords: ["map"] },
      { emoji: "🧭", name: "Compass", keywords: ["navigation"] },
      { emoji: "🏖️", name: "Beach With Umbrella", keywords: ["vacation"] },
      { emoji: "🏝️", name: "Desert Island", keywords: ["vacation"] },
      { emoji: "🏔️", name: "Snow-Capped Mountain", keywords: ["nature"] },
    ],
  },
  {
    id: "objects",
    label: "Objects",
    items: [
      { emoji: "⌚", name: "Watch", keywords: ["time"] },
      { emoji: "📱", name: "Mobile Phone", keywords: ["phone"] },
      { emoji: "💻", name: "Laptop", keywords: ["computer"] },
      { emoji: "⌨️", name: "Keyboard", keywords: ["computer"] },
      { emoji: "🖥️", name: "Desktop Computer", keywords: ["computer"] },
      { emoji: "🖨️", name: "Printer", keywords: ["office"] },
      { emoji: "🖱️", name: "Computer Mouse", keywords: ["computer"] },
      { emoji: "💽", name: "Computer Disk", keywords: ["storage"] },
      { emoji: "📷", name: "Camera", keywords: ["photo"] },
      { emoji: "📹", name: "Video Camera", keywords: ["video"] },
      { emoji: "🎧", name: "Headphone", keywords: ["music"] },
      { emoji: "🎤", name: "Microphone", keywords: ["music"] },
      { emoji: "🔋", name: "Battery", keywords: ["power"] },
      { emoji: "🔌", name: "Electric Plug", keywords: ["power"] },
      { emoji: "💡", name: "Light Bulb", keywords: ["idea"] },
      { emoji: "🔦", name: "Flashlight", keywords: ["light"] },
      { emoji: "🕯️", name: "Candle", keywords: ["light"] },
      { emoji: "🧯", name: "Fire Extinguisher", keywords: ["safety"] },
      { emoji: "🧰", name: "Toolbox", keywords: ["tools"] },
      { emoji: "🔧", name: "Wrench", keywords: ["tool"] },
      { emoji: "🔨", name: "Hammer", keywords: ["tool"] },
      { emoji: "⚙️", name: "Gear", keywords: ["settings"] },
      { emoji: "🧲", name: "Magnet", keywords: ["science"] },
      { emoji: "🪫", name: "Low Battery", keywords: ["battery"] },
      { emoji: "🧪", name: "Test Tube", keywords: ["lab"] },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    items: [
      { emoji: "❤️", name: "Red Heart", keywords: ["love"] },
      { emoji: "🧡", name: "Orange Heart", keywords: ["love"] },
      { emoji: "💛", name: "Yellow Heart", keywords: ["love"] },
      { emoji: "💚", name: "Green Heart", keywords: ["love"] },
      { emoji: "💙", name: "Blue Heart", keywords: ["love"] },
      { emoji: "💜", name: "Purple Heart", keywords: ["love"] },
      { emoji: "🖤", name: "Black Heart", keywords: ["love"] },
      { emoji: "🤍", name: "White Heart", keywords: ["love"] },
      { emoji: "🤎", name: "Brown Heart", keywords: ["love"] },
      { emoji: "💔", name: "Broken Heart", keywords: ["sad"] },
      { emoji: "❣️", name: "Heart Exclamation", keywords: ["love"] },
      { emoji: "💯", name: "Hundred Points", keywords: ["perfect"] },
      { emoji: "✅", name: "Check Mark Button", keywords: ["done"] },
      { emoji: "☑️", name: "Check Box With Check", keywords: ["done"] },
      { emoji: "✔️", name: "Check Mark", keywords: ["done"] },
      { emoji: "❌", name: "Cross Mark", keywords: ["wrong"] },
      { emoji: "⭕", name: "Hollow Red Circle", keywords: ["circle"] },
      { emoji: "⚠️", name: "Warning", keywords: ["alert"] },
      { emoji: "🚫", name: "Prohibited", keywords: ["no"] },
      { emoji: "🔞", name: "No One Under Eighteen", keywords: ["age"] },
      { emoji: "🔔", name: "Bell", keywords: ["notification"] },
      { emoji: "🔕", name: "Bell With Slash", keywords: ["mute"] },
      { emoji: "🔁", name: "Repeat Button", keywords: ["repeat"] },
      { emoji: "♻️", name: "Recycling Symbol", keywords: ["recycle"] },
      { emoji: "📛", name: "Name Badge", keywords: ["badge"] },
    ],
  },
  {
    id: "flags",
    label: "Flags",
    items: [
      { emoji: "🏳️", name: "White Flag", keywords: ["flag"] },
      { emoji: "🏴", name: "Black Flag", keywords: ["flag"] },
      { emoji: "🏁", name: "Chequered Flag", keywords: ["finish"] },
      { emoji: "🚩", name: "Triangular Flag", keywords: ["marker"] },
      { emoji: "🏳️‍🌈", name: "Rainbow Flag", keywords: ["pride"] },
      { emoji: "🏳️‍⚧️", name: "Transgender Flag", keywords: ["pride"] },
      { emoji: "🇺🇸", name: "Flag: United States", keywords: ["usa", "america"] },
      { emoji: "🇨🇦", name: "Flag: Canada", keywords: ["canada"] },
      { emoji: "🇲🇽", name: "Flag: Mexico", keywords: ["mexico"] },
      { emoji: "🇬🇧", name: "Flag: United Kingdom", keywords: ["uk", "britain"] },
      { emoji: "🇩🇪", name: "Flag: Germany", keywords: ["germany"] },
      { emoji: "🇫🇷", name: "Flag: France", keywords: ["france"] },
      { emoji: "🇪🇸", name: "Flag: Spain", keywords: ["spain"] },
      { emoji: "🇮🇹", name: "Flag: Italy", keywords: ["italy"] },
      { emoji: "🇯🇵", name: "Flag: Japan", keywords: ["japan"] },
      { emoji: "🇰🇷", name: "Flag: South Korea", keywords: ["korea"] },
      { emoji: "🇨🇳", name: "Flag: China", keywords: ["china"] },
      { emoji: "🇸🇬", name: "Flag: Singapore", keywords: ["singapore"] },
      { emoji: "🇦🇺", name: "Flag: Australia", keywords: ["australia"] },
      { emoji: "🇳🇿", name: "Flag: New Zealand", keywords: ["new zealand"] },
      { emoji: "🇮🇳", name: "Flag: India", keywords: ["india"] },
      { emoji: "🇧🇷", name: "Flag: Brazil", keywords: ["brazil"] },
      { emoji: "🇦🇷", name: "Flag: Argentina", keywords: ["argentina"] },
      { emoji: "🇿🇦", name: "Flag: South Africa", keywords: ["south africa"] },
      { emoji: "🇺🇳", name: "Flag: United Nations", keywords: ["un"] },
    ],
  },
];

function includesQuery(item: EmojiItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    item.emoji.includes(q) ||
    item.name.toLowerCase().includes(q) ||
    item.keywords.some((keyword) => keyword.toLowerCase().includes(q))
  );
}

export function EmojiCatalogTool() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<EmojiCategoryId | "all">("all");
  const [copiedEmoji, setCopiedEmoji] = useState("");

  const visibleGroups = useMemo(() => {
    return EMOJI_CATEGORIES.map((group) => {
      const categoryPass = activeCategory === "all" || group.id === activeCategory;
      const items = categoryPass ? group.items.filter((item) => includesQuery(item, query)) : [];
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [activeCategory, query]);

  const totalShown = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);

  async function copyEmoji(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedEmoji(value);
      window.setTimeout(() => {
        setCopiedEmoji((prev) => (prev === value ? "" : prev));
      }, 1000);
    } catch {
      // Fallback for browsers/pages where Clipboard API is blocked.
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const ok = document.execCommand("copy");
        setCopiedEmoji(ok ? value : "");
      } catch {
        setCopiedEmoji("");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  return (
    <section className="mt-8 grid gap-4">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Emoji Catalog</h2>
        <p className="mt-2 text-sm text-muted">
          Browse emoji by category, search by keyword, and click any emoji to copy.
        </p>

        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-foreground">Search Emoji</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. heart, smile, usa, pizza"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
          />
        </label>

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
          {EMOJI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                activeCategory === category.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-line bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Visible Emojis</p>
            <p className="mt-2 text-2xl font-bold">{totalShown}</p>
            <p className="mt-1 text-xs text-muted">Count after current search and filters.</p>
          </article>
          <article className="rounded-2xl border border-line bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Copy Status</p>
            <p className="mt-2 text-sm text-foreground">
              {copiedEmoji ? `Copied: ${copiedEmoji}` : "Click any emoji tile to copy."}
            </p>
          </article>
        </div>

        <div className="mt-5 space-y-4">
          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => (
              <article key={group.id} className="rounded-2xl border border-line bg-white p-3">
                <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
                  {group.items.map((item) => (
                    <button
                      key={`${group.id}-${item.emoji}-${item.name}`}
                      type="button"
                      onClick={() => void copyEmoji(item.emoji)}
                      className="rounded-lg border border-line bg-surface p-2 text-center transition hover:border-brand hover:bg-brand/5"
                      title={`${item.name} (${item.emoji})`}
                    >
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="mt-1 line-clamp-1 text-[10px] text-muted">{item.name}</div>
                      <div className="mt-1 text-[10px] font-semibold text-brand">
                        {copiedEmoji === item.emoji ? "Copied!" : "Click to copy"}
                      </div>
                    </button>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-2xl border border-line bg-white p-4 text-sm text-muted">
              No emoji found for this query and category.
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
