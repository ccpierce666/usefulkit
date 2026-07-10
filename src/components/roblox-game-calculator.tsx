"use client";

import { useMemo, useState } from "react";

type RobloxGameCalculatorProps = {
  gameSlug: string;
  gameName: string;
};

const growCrops = [
  { name: "Carrot", value: 22 },
  { name: "Strawberry", value: 48 },
  { name: "Blueberry", value: 95 },
  { name: "Watermelon", value: 310 },
  { name: "Pumpkin", value: 520 },
  { name: "Dragon Fruit", value: 1250 },
];

const growMutations = [
  { name: "None", multiplier: 1 },
  { name: "Wet", multiplier: 2 },
  { name: "Golden", multiplier: 5 },
  { name: "Rainbow", multiplier: 12 },
  { name: "Shocked", multiplier: 18 },
];

const brainrots = [
  { name: "Noobini Pizzanini", cost: 25, income: 1 },
  { name: "Tralalero Tralala", cost: 3200, income: 85 },
  { name: "Brr Brr Patapim", cost: 18000, income: 430 },
  { name: "Tung Tung Sahur", cost: 85000, income: 2100 },
  { name: "Cappuccino Assassino", cost: 420000, income: 10500 },
];

const brainrotBoosts = [
  { name: "None", multiplier: 1 },
  { name: "Gold", multiplier: 1.5 },
  { name: "Diamond", multiplier: 2 },
  { name: "Rainbow", multiplier: 3 },
  { name: "Secret", multiplier: 5 },
];

const fishRows = [
  { name: "Trout", location: "Moosewood", weather: "Any", time: "Any", bait: "Worm", rod: "Training Rod" },
  { name: "Pike", location: "Moosewood", weather: "Rain", time: "Day", bait: "Minnow", rod: "Carbon Rod" },
  { name: "Glacierfish", location: "Snowcap", weather: "Fog", time: "Night", bait: "Shrimp", rod: "Steady Rod" },
  { name: "Voltfish", location: "Roslit Bay", weather: "Storm", time: "Night", bait: "Magnet", rod: "Magnet Rod" },
  { name: "Manta Ray", location: "Terrapin", weather: "Clear", time: "Day", bait: "Squid", rod: "Rapid Rod" },
  { name: "Mythic Serpent", location: "Ancient Isle", weather: "Storm", time: "Night", bait: "Truffle Worm", rod: "Mythical Rod" },
];

const fruits = [
  { name: "Light", value: 650000, demand: 3 },
  { name: "Buddha", value: 7000000, demand: 5 },
  { name: "Portal", value: 8000000, demand: 4 },
  { name: "Dough", value: 25000000, demand: 5 },
  { name: "Leopard", value: 40000000, demand: 5 },
  { name: "Dragon", value: 90000000, demand: 5 },
];

const nightClasses = [
  { name: "Survivor", woodUse: 1, foodUse: 1, ammoUse: 0.4 },
  { name: "Scout", woodUse: 0.8, foodUse: 1.1, ammoUse: 0.6 },
  { name: "Medic", woodUse: 1, foodUse: 0.9, ammoUse: 0.3 },
  { name: "Defender", woodUse: 1.4, foodUse: 1, ammoUse: 0.8 },
];

function numberFormat(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function percentFormat(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function getNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function makeNumberInputProps(min = 0, step = "1") {
  return {
    type: "number",
    inputMode: "decimal" as const,
    min,
    step,
  };
}

export function RobloxGameCalculator({ gameSlug, gameName }: RobloxGameCalculatorProps) {
  if (gameSlug === "grow-a-garden") {
    return <GrowGardenCalculator />;
  }

  if (gameSlug === "steal-a-brainrot") {
    return <BrainrotCalculator />;
  }

  if (gameSlug === "fisch") {
    return <FischFinder />;
  }

  if (gameSlug === "blox-fruits") {
    return <BloxFruitsCalculator />;
  }

  if (gameSlug === "99-nights-in-the-forest") {
    return <ForestPlanner />;
  }

  return (
    <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{gameName} Tool</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        A dedicated calculator for this game is coming soon.
      </p>
    </section>
  );
}

function PanelShell({
  eyebrow,
  title,
  children,
  result,
  helper,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  result: React.ReactNode;
  helper?: string;
}) {
  return (
    <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">{title}</h2>
      {helper ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{helper}</p> : null}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-4 rounded-2xl border border-line bg-white p-4">{children}</div>
        <div className="rounded-2xl border border-brand/20 bg-brand/10 p-5">{result}</div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand";
}

function ActionRow({ onCalculate, onReset }: { onCalculate: () => void; onReset: () => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onCalculate}
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        Calculate
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
      >
        Reset
      </button>
    </div>
  );
}

function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-line bg-white px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
          <p className="mt-1 font-semibold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function GrowGardenCalculator() {
  const [cropName, setCropName] = useState(growCrops[2].name);
  const [mutationName, setMutationName] = useState(growMutations[0].name);
  const [quantity, setQuantity] = useState("12");
  const [friendBoost, setFriendBoost] = useState("10");
  const [petBoost, setPetBoost] = useState("15");
  const [submitted, setSubmitted] = useState({
    cropName: growCrops[2].name,
    mutationName: growMutations[0].name,
    quantity: "12",
    friendBoost: "10",
    petBoost: "15",
  });

  const crop = growCrops.find((item) => item.name === submitted.cropName) ?? growCrops[0];
  const mutation = growMutations.find((item) => item.name === submitted.mutationName) ?? growMutations[0];
  const qty = Math.max(0, getNumber(submitted.quantity));
  const friendBoostValue = Math.max(0, getNumber(submitted.friendBoost));
  const petBoostValue = Math.max(0, getNumber(submitted.petBoost));
  const boost = 1 + friendBoostValue / 100 + petBoostValue / 100;
  const total = crop.value * mutation.multiplier * qty * boost;
  const normalTotal = crop.value * qty;
  const reset = () => {
    setCropName(growCrops[2].name);
    setMutationName(growMutations[0].name);
    setQuantity("12");
    setFriendBoost("10");
    setPetBoost("15");
    setSubmitted({
      cropName: growCrops[2].name,
      mutationName: growMutations[0].name,
      quantity: "12",
      friendBoost: "10",
      petBoost: "15",
    });
  };

  return (
    <PanelShell
      eyebrow="Live Calculator"
      title="Grow a Garden Crop Value Calculator"
      helper="Choose a crop, mutation, quantity, and bonus setup, then click Calculate to update the estimate."
      result={
        <div>
          <p className="text-sm font-semibold text-brand">Estimated harvest value</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{numberFormat(total)}</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Base harvest: {numberFormat(normalTotal)}. Current setup is about{" "}
            {total > 0 && normalTotal > 0 ? `${(total / normalTotal).toFixed(1)}x` : "0x"} base value.
          </p>
          <DetailGrid
            items={[
              { label: "Base value", value: numberFormat(crop.value) },
              { label: "Mutation", value: `${mutation.multiplier}x` },
              { label: "Bonus", value: `${friendBoostValue + petBoostValue}%` },
              { label: "Formula", value: "base x mutation x qty x bonus" },
            ]}
          />
        </div>
      }
    >
      <Field label="Crop">
        <select className={inputClassName()} value={cropName} onChange={(event) => setCropName(event.target.value)}>
          {growCrops.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Mutation">
        <select
          className={inputClassName()}
          value={mutationName}
          onChange={(event) => setMutationName(event.target.value)}
        >
          {growMutations.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Quantity">
          <input
            {...makeNumberInputProps(0)}
            className={inputClassName()}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </Field>
        <Field label="Friend boost %">
          <input
            {...makeNumberInputProps(0)}
            className={inputClassName()}
            value={friendBoost}
            onChange={(event) => setFriendBoost(event.target.value)}
          />
        </Field>
        <Field label="Pet boost %">
          <input
            {...makeNumberInputProps(0)}
            className={inputClassName()}
            value={petBoost}
            onChange={(event) => setPetBoost(event.target.value)}
          />
        </Field>
      </div>
      <ActionRow
        onCalculate={() => setSubmitted({ cropName, mutationName, quantity, friendBoost, petBoost })}
        onReset={reset}
      />
    </PanelShell>
  );
}

function BrainrotCalculator() {
  const [unitName, setUnitName] = useState(brainrots[2].name);
  const [boostName, setBoostName] = useState(brainrotBoosts[0].name);
  const [count, setCount] = useState("1");
  const [minutes, setMinutes] = useState("30");
  const [serverBoost, setServerBoost] = useState("20");
  const [submitted, setSubmitted] = useState({
    unitName: brainrots[2].name,
    boostName: brainrotBoosts[0].name,
    count: "1",
    minutes: "30",
    serverBoost: "20",
  });

  const unit = brainrots.find((item) => item.name === submitted.unitName) ?? brainrots[0];
  const boost = brainrotBoosts.find((item) => item.name === submitted.boostName) ?? brainrotBoosts[0];
  const owned = Math.max(0, getNumber(submitted.count));
  const time = Math.max(0, getNumber(submitted.minutes));
  const serverBoostValue = Math.max(0, getNumber(submitted.serverBoost));
  const multiplier = boost.multiplier * (1 + serverBoostValue / 100);
  const incomePerMinute = unit.income * owned * multiplier;
  const sessionIncome = incomePerMinute * time;
  const paybackMinutes = incomePerMinute > 0 ? (unit.cost * owned) / incomePerMinute : 0;
  const reset = () => {
    setUnitName(brainrots[2].name);
    setBoostName(brainrotBoosts[0].name);
    setCount("1");
    setMinutes("30");
    setServerBoost("20");
    setSubmitted({
      unitName: brainrots[2].name,
      boostName: brainrotBoosts[0].name,
      count: "1",
      minutes: "30",
      serverBoost: "20",
    });
  };

  return (
    <PanelShell
      eyebrow="Live Calculator"
      title="Steal a Brainrot Income and Payback Calculator"
      helper="Estimate session income and rough payback time from unit cost, income rate, count, mutation, and boost."
      result={
        <div>
          <p className="text-sm font-semibold text-brand">Estimated session income</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{numberFormat(sessionIncome)}</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Income rate: {numberFormat(incomePerMinute)} per minute. Payback estimate:{" "}
            {paybackMinutes > 0 ? `${paybackMinutes.toFixed(1)} minutes` : "not available"}.
          </p>
          <DetailGrid
            items={[
              { label: "Unit cost", value: numberFormat(unit.cost) },
              { label: "Base income", value: `${numberFormat(unit.income)}/min` },
              { label: "Multiplier", value: `${multiplier.toFixed(2)}x` },
              { label: "Session", value: `${time} min` },
            ]}
          />
        </div>
      }
    >
      <Field label="Brainrot">
        <select className={inputClassName()} value={unitName} onChange={(event) => setUnitName(event.target.value)}>
          {brainrots.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Mutation or rarity boost">
        <select className={inputClassName()} value={boostName} onChange={(event) => setBoostName(event.target.value)}>
          {brainrotBoosts.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Owned count">
          <input
            {...makeNumberInputProps(0)}
            className={inputClassName()}
            value={count}
            onChange={(event) => setCount(event.target.value)}
          />
        </Field>
        <Field label="Minutes">
          <input
            {...makeNumberInputProps(0)}
            className={inputClassName()}
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
        </Field>
        <Field label="Server boost %">
          <input
            {...makeNumberInputProps(0)}
            className={inputClassName()}
            value={serverBoost}
            onChange={(event) => setServerBoost(event.target.value)}
          />
        </Field>
      </div>
      <ActionRow
        onCalculate={() => setSubmitted({ unitName, boostName, count, minutes, serverBoost })}
        onReset={reset}
      />
    </PanelShell>
  );
}

function FischFinder() {
  const locations = ["Any", ...Array.from(new Set(fishRows.map((item) => item.location)))];
  const weathers = ["Any", "Clear", "Rain", "Fog", "Storm"];
  const times = ["Any", "Day", "Night"];
  const [location, setLocation] = useState("Any");
  const [weather, setWeather] = useState("Any");
  const [time, setTime] = useState("Any");
  const [submitted, setSubmitted] = useState({ location: "Any", weather: "Any", time: "Any" });

  const matches = useMemo(
    () =>
      fishRows.filter((fish) => {
        const locationMatch = submitted.location === "Any" || fish.location === submitted.location;
        const weatherMatch =
          submitted.weather === "Any" || fish.weather === "Any" || fish.weather === submitted.weather;
        const timeMatch = submitted.time === "Any" || fish.time === "Any" || fish.time === submitted.time;
        return locationMatch && weatherMatch && timeMatch;
      }),
    [submitted]
  );
  const reset = () => {
    setLocation("Any");
    setWeather("Any");
    setTime("Any");
    setSubmitted({ location: "Any", weather: "Any", time: "Any" });
  };

  return (
    <PanelShell
      eyebrow="Live Finder"
      title="Fisch Fish Finder"
      helper="Filter the sample fish table by location, weather, and time. Click Calculate to refresh matching catches."
      result={
        <div>
          <p className="text-sm font-semibold text-brand">Matching fish</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{matches.length}</p>
          <div className="mt-4 grid gap-2">
            {matches.slice(0, 4).map((fish) => (
              <div key={fish.name} className="rounded-xl border border-line bg-white p-3 text-sm">
                <p className="font-semibold">{fish.name}</p>
                <p className="mt-1 text-muted">
                  {fish.location} - {fish.weather} - {fish.time} - {fish.bait}
                </p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <Field label="Location">
        <select className={inputClassName()} value={location} onChange={(event) => setLocation(event.target.value)}>
          {locations.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Weather">
          <select className={inputClassName()} value={weather} onChange={(event) => setWeather(event.target.value)}>
            {weathers.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Time">
          <select className={inputClassName()} value={time} onChange={(event) => setTime(event.target.value)}>
            {times.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="rounded-2xl border border-line bg-[#f8fafc] p-4 text-sm leading-6 text-muted">
        Best gear from current matches:{" "}
        <span className="font-semibold text-foreground">
          {matches[0] ? `${matches[0].rod} with ${matches[0].bait}` : "no match"}
        </span>
      </div>
      <ActionRow onCalculate={() => setSubmitted({ location, weather, time })} onReset={reset} />
    </PanelShell>
  );
}

function BloxFruitsCalculator() {
  const [fruitName, setFruitName] = useState(fruits[3].name);
  const [quantity, setQuantity] = useState("1");
  const [demandAdjust, setDemandAdjust] = useState("0");
  const [submitted, setSubmitted] = useState({
    fruitName: fruits[3].name,
    quantity: "1",
    demandAdjust: "0",
  });
  const fruit = fruits.find((item) => item.name === submitted.fruitName) ?? fruits[0];
  const qty = Math.max(0, getNumber(submitted.quantity));
  const demandAdjustValue = Math.max(-50, Math.min(50, getNumber(submitted.demandAdjust)));
  const demandMultiplier = 1 + demandAdjustValue / 100;
  const estimatedValue = fruit.value * qty * demandMultiplier;
  const lowRange = estimatedValue * 0.9;
  const highRange = estimatedValue * 1.12;
  const reset = () => {
    setFruitName(fruits[3].name);
    setQuantity("1");
    setDemandAdjust("0");
    setSubmitted({ fruitName: fruits[3].name, quantity: "1", demandAdjust: "0" });
  };

  return (
    <PanelShell
      eyebrow="Live Calculator"
      title="Blox Fruits Trade Value Estimator"
      helper="Estimate a fruit trade range from base value, quantity, demand score, and a manual market adjustment."
      result={
        <div>
          <p className="text-sm font-semibold text-brand">Estimated trade value</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{numberFormat(estimatedValue)}</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Practical range: {numberFormat(lowRange)} to {numberFormat(highRange)}. Demand score:{" "}
            {fruit.demand}/5.
          </p>
          <DetailGrid
            items={[
              { label: "Base value", value: numberFormat(fruit.value) },
              { label: "Quantity", value: numberFormat(qty) },
              { label: "Adjustment", value: `${demandAdjustValue}%` },
              { label: "Range spread", value: "90% - 112%" },
            ]}
          />
        </div>
      }
    >
      <Field label="Fruit">
        <select className={inputClassName()} value={fruitName} onChange={(event) => setFruitName(event.target.value)}>
          {fruits.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantity">
          <input
            {...makeNumberInputProps(0)}
            className={inputClassName()}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </Field>
        <Field label="Demand adjustment %">
          <input
            {...makeNumberInputProps(-50)}
            className={inputClassName()}
            value={demandAdjust}
            onChange={(event) => setDemandAdjust(event.target.value)}
          />
        </Field>
      </div>
      <div className="rounded-2xl border border-line bg-[#f8fafc] p-4 text-sm leading-6 text-muted">
        Use negative demand when the market is flooded and positive demand when a fruit is moving
        fast after updates.
      </div>
      <ActionRow onCalculate={() => setSubmitted({ fruitName, quantity, demandAdjust })} onReset={reset} />
    </PanelShell>
  );
}

function ForestPlanner() {
  const [className, setClassName] = useState(nightClasses[0].name);
  const [players, setPlayers] = useState("3");
  const [nights, setNights] = useState("10");
  const [wood, setWood] = useState("45");
  const [food, setFood] = useState("38");
  const [ammo, setAmmo] = useState("20");
  const [submitted, setSubmitted] = useState({
    className: nightClasses[0].name,
    players: "3",
    nights: "10",
    wood: "45",
    food: "38",
    ammo: "20",
  });
  const selectedClass = nightClasses.find((item) => item.name === submitted.className) ?? nightClasses[0];
  const playerCount = Math.max(1, getNumber(submitted.players, 1));
  const nightCount = Math.max(1, getNumber(submitted.nights, 1));
  const woodNeed = selectedClass.woodUse * playerCount * nightCount;
  const foodNeed = selectedClass.foodUse * playerCount * nightCount;
  const ammoNeed = selectedClass.ammoUse * playerCount * nightCount;
  const woodRatio = getNumber(submitted.wood) / woodNeed;
  const foodRatio = getNumber(submitted.food) / foodNeed;
  const ammoRatio = getNumber(submitted.ammo) / ammoNeed;
  const survivalScore = Math.min(1, woodRatio, foodRatio, ammoRatio);
  const risk = survivalScore >= 1 ? "Low" : survivalScore >= 0.7 ? "Medium" : "High";
  const reset = () => {
    setClassName(nightClasses[0].name);
    setPlayers("3");
    setNights("10");
    setWood("45");
    setFood("38");
    setAmmo("20");
    setSubmitted({
      className: nightClasses[0].name,
      players: "3",
      nights: "10",
      wood: "45",
      food: "38",
      ammo: "20",
    });
  };

  return (
    <PanelShell
      eyebrow="Live Planner"
      title="99 Nights Resource Risk Planner"
      helper="Estimate whether the current team has enough wood, food, and ammo for the next run segment."
      result={
        <div>
          <p className="text-sm font-semibold text-brand">Estimated risk</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{risk}</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Coverage: {percentFormat(Math.max(0, survivalScore))}. Target resources:{" "}
            {numberFormat(woodNeed)} wood, {numberFormat(foodNeed)} food, {numberFormat(ammoNeed)} ammo.
          </p>
          <DetailGrid
            items={[
              { label: "Wood coverage", value: percentFormat(woodRatio) },
              { label: "Food coverage", value: percentFormat(foodRatio) },
              { label: "Ammo coverage", value: percentFormat(ammoRatio) },
              { label: "Nights", value: numberFormat(nightCount) },
            ]}
          />
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Class">
          <select className={inputClassName()} value={className} onChange={(event) => setClassName(event.target.value)}>
            {nightClasses.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Players">
          <input
            {...makeNumberInputProps(1)}
            className={inputClassName()}
            value={players}
            onChange={(event) => setPlayers(event.target.value)}
          />
        </Field>
        <Field label="Nights ahead">
          <input
            {...makeNumberInputProps(1)}
            className={inputClassName()}
            value={nights}
            onChange={(event) => setNights(event.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Wood">
          <input {...makeNumberInputProps(0)} className={inputClassName()} value={wood} onChange={(event) => setWood(event.target.value)} />
        </Field>
        <Field label="Food">
          <input {...makeNumberInputProps(0)} className={inputClassName()} value={food} onChange={(event) => setFood(event.target.value)} />
        </Field>
        <Field label="Ammo">
          <input {...makeNumberInputProps(0)} className={inputClassName()} value={ammo} onChange={(event) => setAmmo(event.target.value)} />
        </Field>
      </div>
      <ActionRow
        onCalculate={() => setSubmitted({ className, players, nights, wood, food, ammo })}
        onReset={reset}
      />
    </PanelShell>
  );
}
