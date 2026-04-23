"use client";

import { useMemo, useState } from "react";

type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthdayInDays: number;
  isValid: boolean;
};

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string): Date | null {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function calculateAge(birthDate: Date, atDate: Date): AgeResult {
  if (birthDate > atDate) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      nextBirthdayInDays: 0,
      isValid: false,
    };
  }

  let years = atDate.getFullYear() - birthDate.getFullYear();
  let months = atDate.getMonth() - birthDate.getMonth();
  let days = atDate.getDate() - birthDate.getDate();

  if (days < 0) {
    const previousMonth = new Date(atDate.getFullYear(), atDate.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const startUtc = Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  const endUtc = Date.UTC(atDate.getFullYear(), atDate.getMonth(), atDate.getDate());
  const totalDays = Math.floor((endUtc - startUtc) / 86400000);

  const nextBirthdayYear =
    atDate.getMonth() > birthDate.getMonth() ||
    (atDate.getMonth() === birthDate.getMonth() && atDate.getDate() >= birthDate.getDate())
      ? atDate.getFullYear() + 1
      : atDate.getFullYear();
  const nextBirthday = new Date(nextBirthdayYear, birthDate.getMonth(), birthDate.getDate());
  const nextBirthdayUtc = Date.UTC(
    nextBirthday.getFullYear(),
    nextBirthday.getMonth(),
    nextBirthday.getDate(),
  );
  const nextBirthdayInDays = Math.floor((nextBirthdayUtc - endUtc) / 86400000);

  return {
    years,
    months,
    days,
    totalDays,
    nextBirthdayInDays,
    isValid: true,
  };
}

export function AgeCalculatorTool() {
  const today = toDateInputValue(new Date());
  const [birthDate, setBirthDate] = useState("");
  const [asOfDate, setAsOfDate] = useState(today);

  const result = useMemo(() => {
    const birth = parseLocalDate(birthDate);
    const asOf = parseLocalDate(asOfDate);

    if (!birth || !asOf) {
      return null;
    }

    return calculateAge(birth, asOf);
  }, [birthDate, asOfDate]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Age Calculator</h2>
        <p className="mt-2 text-sm text-muted">Enter your date of birth and reference date.</p>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Date of Birth</span>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Age At Date</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Age</p>
          <p className="mt-2 text-2xl font-bold">
            {result?.isValid
              ? `${result.years} years, ${result.months} months, ${result.days} days`
              : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Days Lived</p>
          <p className="mt-2 text-3xl font-bold">
            {result?.isValid ? result.totalDays.toLocaleString() : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Next Birthday In</p>
          <p className="mt-2 text-3xl font-bold">
            {result?.isValid ? `${result.nextBirthdayInDays.toLocaleString()} days` : "--"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
          <p className="mt-2 text-sm font-semibold text-muted">
            {!birthDate
              ? "Enter a date of birth to calculate."
              : result?.isValid
                ? "Calculation complete."
                : "Birth date must be earlier than the reference date."}
          </p>
        </article>
      </div>
    </section>
  );
}
