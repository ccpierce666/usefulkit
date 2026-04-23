"use client";

import { useMemo, useState } from "react";

type Participant = {
  name: string;
  timeZone: string;
  start: string;
  end: string;
};

type Candidate = {
  startUtc: Date;
  endUtc: Date;
  score: number;
};

const TIME_ZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const SLOT_STEP_MINUTES = 30;

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date): string {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function minutesFromHHMM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function datePartsInZone(date: Date, timeZone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value || 0);
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
  };
}

function dateKeyFromParts(parts: { year: number; month: number; day: number }): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function localMinutes(parts: { hour: number; minute: number }): number {
  return parts.hour * 60 + parts.minute;
}

function formatSlotForZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatUtcForIcs(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

function zonedDateTimeToUtc(localDate: string, localTime: string, timeZone: string): Date {
  const [y, m, d] = localDate.split("-").map(Number);
  const [hh, mm] = localTime.split(":").map(Number);
  const desired = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);

  let guess = desired;
  for (let i = 0; i < 6; i += 1) {
    const parts = datePartsInZone(new Date(guess), timeZone);
    const observed = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    const diff = desired - observed;
    if (diff === 0) break;
    guess += diff;
  }

  return new Date(guess);
}

function participantFitsSlot(
  participant: Participant,
  slotStartUtc: Date,
  slotEndUtc: Date,
): { ok: boolean; midpointPenalty: number } {
  const startParts = datePartsInZone(slotStartUtc, participant.timeZone);
  const endParts = datePartsInZone(new Date(slotEndUtc.getTime() - 1000), participant.timeZone);

  const sameLocalDay = dateKeyFromParts(startParts) === dateKeyFromParts(endParts);
  if (!sameLocalDay) {
    return { ok: false, midpointPenalty: 0 };
  }

  const startLocal = localMinutes(startParts);
  const endLocal = localMinutes(endParts) + 1;
  const windowStart = minutesFromHHMM(participant.start);
  const windowEnd = minutesFromHHMM(participant.end);
  const ok = startLocal >= windowStart && endLocal <= windowEnd;
  if (!ok) {
    return { ok: false, midpointPenalty: 0 };
  }

  const slotMid = (startLocal + endLocal) / 2;
  const windowMid = (windowStart + windowEnd) / 2;
  return { ok: true, midpointPenalty: Math.abs(slotMid - windowMid) };
}

export function TimeZoneMeetingPlannerTool() {
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [duration, setDuration] = useState(60);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      name: "You",
      timeZone: "America/New_York",
      start: "09:00",
      end: "18:00",
    },
    {
      name: "Teammate",
      timeZone: "Europe/London",
      start: "09:00",
      end: "18:00",
    },
    {
      name: "Partner",
      timeZone: "Asia/Shanghai",
      start: "09:00",
      end: "18:00",
    },
  ]);
  const [convDate, setConvDate] = useState(toDateInputValue(new Date()));
  const [convTime, setConvTime] = useState(toTimeInputValue(new Date()));
  const [fromZone, setFromZone] = useState("America/New_York");
  const [toZoneA, setToZoneA] = useState("Europe/London");
  const [toZoneB, setToZoneB] = useState("Asia/Shanghai");

  const suggestions = useMemo(() => {
    const organizerTz = participants[0]?.timeZone;
    if (!organizerTz) {
      return [];
    }

    const durationMs = duration * 60000;
    const scanStart = new Date(`${date}T00:00:00.000Z`).getTime() - 18 * 3600000;
    const scanEnd = scanStart + 60 * 3600000;
    const stepMs = SLOT_STEP_MINUTES * 60000;

    const matches: Candidate[] = [];
    for (let ts = scanStart; ts <= scanEnd; ts += stepMs) {
      const slotStart = new Date(ts);
      const slotEnd = new Date(ts + durationMs);
      const organizerDateKey = dateKeyFromParts(datePartsInZone(slotStart, organizerTz));
      if (organizerDateKey !== date) {
        continue;
      }

      let allOk = true;
      let totalPenalty = 0;
      for (const p of participants) {
        const check = participantFitsSlot(p, slotStart, slotEnd);
        if (!check.ok) {
          allOk = false;
          break;
        }
        totalPenalty += check.midpointPenalty;
      }
      if (allOk) {
        matches.push({ startUtc: slotStart, endUtc: slotEnd, score: totalPenalty });
      }
    }

    return matches.sort((a, b) => a.score - b.score).slice(0, 8);
  }, [date, duration, participants]);

  const updateParticipant = (index: number, patch: Partial<Participant>) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const convertedPoint = useMemo(() => {
    return zonedDateTimeToUtc(convDate, convTime, fromZone);
  }, [convDate, convTime, fromZone]);

  const copySlot = async (slot: Candidate) => {
    const lines = participants.map(
      (p) =>
        `${p.name} (${p.timeZone}): ${formatSlotForZone(slot.startUtc, p.timeZone)} - ${formatSlotForZone(slot.endUtc, p.timeZone)}`,
    );
    const payload = [`Meeting suggestion`, ...lines].join("\n");
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // Clipboard permissions can be restricted in some browsers.
    }
  };

  const downloadIcs = (slot: Candidate, index: number) => {
    const uid = `${slot.startUtc.getTime()}-${index}@usefulkit.io`;
    const nowStamp = formatUtcForIcs(new Date());
    const startStamp = formatUtcForIcs(slot.startUtc);
    const endStamp = formatUtcForIcs(slot.endUtc);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UsefulKit//Time Zone Meeting Planner//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${startStamp}`,
      `DTEND:${endStamp}`,
      "SUMMARY:UsefulKit Meeting",
      "DESCRIPTION:Generated by UsefulKit Time Zone Meeting Planner",
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `meeting-slot-${index + 1}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Meeting Planner Inputs</h2>
        <p className="mt-2 text-sm text-muted">
          Set each participant&apos;s timezone and work window to find overlap slots.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Meeting Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Duration</span>
            <select
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-3">
          {participants.map((p, idx) => (
            <div key={idx} className="rounded-2xl border border-line bg-white p-3">
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <select
                  value={p.timeZone}
                  onChange={(event) => updateParticipant(idx, { timeZone: event.target.value })}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
                >
                  {TIME_ZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={p.start}
                  onChange={(event) => updateParticipant(idx, { start: event.target.value })}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
                />
                <input
                  type="time"
                  value={p.end}
                  onChange={(event) => updateParticipant(idx, { end: event.target.value })}
                  className="h-10 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h3 className="text-xl font-semibold">Suggested Slots</h3>
        <p className="mt-2 text-sm text-muted">Best overlap windows ranked by fairness.</p>

        {suggestions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white p-4 text-sm text-muted">
            No overlap found for this date. Try wider work windows or shorter duration.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {suggestions.map((slot, index) => (
              <article
                key={`${slot.startUtc.toISOString()}-${index}`}
                className="rounded-2xl border border-line bg-white p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Option {index + 1}
                </p>
                <div className="mt-2 grid gap-1 text-sm text-foreground">
                  {participants.map((p, i) => (
                    <p key={i}>
                      <span className="font-semibold">{p.name}:</span>{" "}
                      {formatSlotForZone(slot.startUtc, p.timeZone)} -{" "}
                      {formatSlotForZone(slot.endUtc, p.timeZone)}
                    </p>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copySlot(slot)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadIcs(slot, index)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                  >
                    Download .ics
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-xl font-semibold">Quick Time Zone Converter</h3>
          <p className="mt-2 text-sm text-muted">
            Convert one specific date and time from one timezone to others.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Date</span>
              <input
                type="date"
                value={convDate}
                onChange={(event) => setConvDate(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Time</span>
              <input
                type="time"
                value={convTime}
                onChange={(event) => setConvTime(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">From</span>
              <select
                value={fromZone}
                onChange={(event) => setFromZone(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                {TIME_ZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">To A</span>
              <select
                value={toZoneA}
                onChange={(event) => setToZoneA(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                {TIME_ZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">To B</span>
              <select
                value={toZoneB}
                onChange={(event) => setToZoneB(event.target.value)}
                className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                {TIME_ZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-2 rounded-2xl border border-line bg-white p-3 text-sm">
            <p>
              <span className="font-semibold">{fromZone}:</span>{" "}
              {formatSlotForZone(convertedPoint, fromZone)}
            </p>
            <p>
              <span className="font-semibold">{toZoneA}:</span>{" "}
              {formatSlotForZone(convertedPoint, toZoneA)}
            </p>
            <p>
              <span className="font-semibold">{toZoneB}:</span>{" "}
              {formatSlotForZone(convertedPoint, toZoneB)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
