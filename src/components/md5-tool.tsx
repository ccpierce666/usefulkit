"use client";

import { useMemo, useState } from "react";

function rotateLeft(lValue: number, shiftBits: number): number {
  return (lValue << shiftBits) | (lValue >>> (32 - shiftBits));
}

function addUnsigned(lX: number, lY: number): number {
  const lX4 = lX & 0x40000000;
  const lY4 = lY & 0x40000000;
  const lX8 = lX & 0x80000000;
  const lY8 = lY & 0x80000000;
  const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);

  if (lX4 & lY4) {
    return lResult ^ 0x80000000 ^ lX8 ^ lY8;
  }
  if (lX4 | lY4) {
    if (lResult & 0x40000000) {
      return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
    }
    return lResult ^ 0x40000000 ^ lX8 ^ lY8;
  }
  return lResult ^ lX8 ^ lY8;
}

function f(x: number, y: number, z: number): number {
  return (x & y) | (~x & z);
}

function g(x: number, y: number, z: number): number {
  return (x & z) | (y & ~z);
}

function h(x: number, y: number, z: number): number {
  return x ^ y ^ z;
}

function i(x: number, y: number, z: number): number {
  return y ^ (x | ~z);
}

function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function convertToWordArray(str: string): number[] {
  const lWordCount: number[] = [];
  const lMessageLength = str.length;
  const lNumberOfWordsTempOne = lMessageLength + 8;
  const lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
  const lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
  let lBytePosition = 0;
  let lByteCount = 0;

  while (lByteCount < lMessageLength) {
    const lWordCountIndex = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordCount[lWordCountIndex] = lWordCount[lWordCountIndex] || 0;
    lWordCount[lWordCountIndex] |= str.charCodeAt(lByteCount) << lBytePosition;
    lByteCount += 1;
  }

  const lWordCountIndex = (lByteCount - (lByteCount % 4)) / 4;
  lBytePosition = (lByteCount % 4) * 8;
  lWordCount[lWordCountIndex] = lWordCount[lWordCountIndex] || 0;
  lWordCount[lWordCountIndex] |= 0x80 << lBytePosition;
  lWordCount[lNumberOfWords - 2] = lMessageLength << 3;
  lWordCount[lNumberOfWords - 1] = lMessageLength >>> 29;

  return lWordCount;
}

function wordToHex(lValue: number): string {
  let wordToHexValue = "";
  for (let lCount = 0; lCount <= 3; lCount += 1) {
    const lByte = (lValue >>> (lCount * 8)) & 255;
    const wordToHexValueTemp = `0${lByte.toString(16)}`;
    wordToHexValue += wordToHexValueTemp.slice(-2);
  }
  return wordToHexValue;
}

function utf8Encode(str: string): string {
  return unescape(encodeURIComponent(str));
}

function md5(str: string): string {
  const x = convertToWordArray(utf8Encode(str));
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const s11 = 7; const s12 = 12; const s13 = 17; const s14 = 22;
  const s21 = 5; const s22 = 9; const s23 = 14; const s24 = 20;
  const s31 = 4; const s32 = 11; const s33 = 16; const s34 = 23;
  const s41 = 6; const s42 = 10; const s43 = 15; const s44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const aa = a;
    const bb = b;
    const cc = c;
    const dd = d;

    a = ff(a, b, c, d, x[k + 0], s11, 0xd76aa478); d = ff(d, a, b, c, x[k + 1], s12, 0xe8c7b756);
    c = ff(c, d, a, b, x[k + 2], s13, 0x242070db); b = ff(b, c, d, a, x[k + 3], s14, 0xc1bdceee);
    a = ff(a, b, c, d, x[k + 4], s11, 0xf57c0faf); d = ff(d, a, b, c, x[k + 5], s12, 0x4787c62a);
    c = ff(c, d, a, b, x[k + 6], s13, 0xa8304613); b = ff(b, c, d, a, x[k + 7], s14, 0xfd469501);
    a = ff(a, b, c, d, x[k + 8], s11, 0x698098d8); d = ff(d, a, b, c, x[k + 9], s12, 0x8b44f7af);
    c = ff(c, d, a, b, x[k + 10], s13, 0xffff5bb1); b = ff(b, c, d, a, x[k + 11], s14, 0x895cd7be);
    a = ff(a, b, c, d, x[k + 12], s11, 0x6b901122); d = ff(d, a, b, c, x[k + 13], s12, 0xfd987193);
    c = ff(c, d, a, b, x[k + 14], s13, 0xa679438e); b = ff(b, c, d, a, x[k + 15], s14, 0x49b40821);

    a = gg(a, b, c, d, x[k + 1], s21, 0xf61e2562); d = gg(d, a, b, c, x[k + 6], s22, 0xc040b340);
    c = gg(c, d, a, b, x[k + 11], s23, 0x265e5a51); b = gg(b, c, d, a, x[k + 0], s24, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[k + 5], s21, 0xd62f105d); d = gg(d, a, b, c, x[k + 10], s22, 0x02441453);
    c = gg(c, d, a, b, x[k + 15], s23, 0xd8a1e681); b = gg(b, c, d, a, x[k + 4], s24, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[k + 9], s21, 0x21e1cde6); d = gg(d, a, b, c, x[k + 14], s22, 0xc33707d6);
    c = gg(c, d, a, b, x[k + 3], s23, 0xf4d50d87); b = gg(b, c, d, a, x[k + 8], s24, 0x455a14ed);
    a = gg(a, b, c, d, x[k + 13], s21, 0xa9e3e905); d = gg(d, a, b, c, x[k + 2], s22, 0xfcefa3f8);
    c = gg(c, d, a, b, x[k + 7], s23, 0x676f02d9); b = gg(b, c, d, a, x[k + 12], s24, 0x8d2a4c8a);

    a = hh(a, b, c, d, x[k + 5], s31, 0xfffa3942); d = hh(d, a, b, c, x[k + 8], s32, 0x8771f681);
    c = hh(c, d, a, b, x[k + 11], s33, 0x6d9d6122); b = hh(b, c, d, a, x[k + 14], s34, 0xfde5380c);
    a = hh(a, b, c, d, x[k + 1], s31, 0xa4beea44); d = hh(d, a, b, c, x[k + 4], s32, 0x4bdecfa9);
    c = hh(c, d, a, b, x[k + 7], s33, 0xf6bb4b60); b = hh(b, c, d, a, x[k + 10], s34, 0xbebfbc70);
    a = hh(a, b, c, d, x[k + 13], s31, 0x289b7ec6); d = hh(d, a, b, c, x[k + 0], s32, 0xeaa127fa);
    c = hh(c, d, a, b, x[k + 3], s33, 0xd4ef3085); b = hh(b, c, d, a, x[k + 6], s34, 0x04881d05);
    a = hh(a, b, c, d, x[k + 9], s31, 0xd9d4d039); d = hh(d, a, b, c, x[k + 12], s32, 0xe6db99e5);
    c = hh(c, d, a, b, x[k + 15], s33, 0x1fa27cf8); b = hh(b, c, d, a, x[k + 2], s34, 0xc4ac5665);

    a = ii(a, b, c, d, x[k + 0], s41, 0xf4292244); d = ii(d, a, b, c, x[k + 7], s42, 0x432aff97);
    c = ii(c, d, a, b, x[k + 14], s43, 0xab9423a7); b = ii(b, c, d, a, x[k + 5], s44, 0xfc93a039);
    a = ii(a, b, c, d, x[k + 12], s41, 0x655b59c3); d = ii(d, a, b, c, x[k + 3], s42, 0x8f0ccc92);
    c = ii(c, d, a, b, x[k + 10], s43, 0xffeff47d); b = ii(b, c, d, a, x[k + 1], s44, 0x85845dd1);
    a = ii(a, b, c, d, x[k + 8], s41, 0x6fa87e4f); d = ii(d, a, b, c, x[k + 15], s42, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[k + 6], s43, 0xa3014314); b = ii(b, c, d, a, x[k + 13], s44, 0x4e0811a1);
    a = ii(a, b, c, d, x[k + 4], s41, 0xf7537e82); d = ii(d, a, b, c, x[k + 11], s42, 0xbd3af235);
    c = ii(c, d, a, b, x[k + 2], s43, 0x2ad7d2bb); b = ii(b, c, d, a, x[k + 9], s44, 0xeb86d391);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  return `${wordToHex(a)}${wordToHex(b)}${wordToHex(c)}${wordToHex(d)}`.toLowerCase();
}

function isLikelyWeakInput(text: string): boolean {
  return /^(123456|password|qwerty|admin|111111|abc123|letmein)$/i.test(text.trim());
}

const COMMON_WEAK_PASSWORDS = [
  "123456",
  "123456789",
  "12345678",
  "12345",
  "password",
  "qwerty",
  "abc123",
  "111111",
  "123123",
  "admin",
  "welcome",
  "letmein",
  "monkey",
  "football",
  "iloveyou",
  "princess",
  "dragon",
  "sunshine",
  "master",
  "hello",
  "freedom",
  "whatever",
  "trustno1",
  "passw0rd",
  "qwerty123",
  "1q2w3e4r",
  "zaq12wsx",
  "000000",
  "654321",
  "superman",
  "baseball",
  "charlie",
  "donald",
  "jordan23",
  "michael",
  "pokemon",
  "starwars",
  "linkedin",
  "google",
  "test123",
  "admin123",
] as const;

export function Md5Tool() {
  const [input, setInput] = useState("");
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [lookupHash, setLookupHash] = useState("");

  const hash = useMemo(() => md5(input), [input]);
  const verifyComputed = useMemo(() => md5(verifyInput), [verifyInput]);
  const weakLookupMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of COMMON_WEAK_PASSWORDS) {
      map.set(md5(item), item);
    }
    return map;
  }, []);

  const verifyOk =
    verifyHash.trim().length === 32 &&
    verifyComputed.toLowerCase() === verifyHash.trim().toLowerCase();
  const normalizedLookupHash = lookupHash.trim().toLowerCase();
  const isLookupHashValid = /^[a-f0-9]{32}$/.test(normalizedLookupHash);
  const lookupResult = isLookupHashValid ? weakLookupMap.get(normalizedLookupHash) : undefined;

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">MD5 Generator</h2>
        <p className="mt-2 text-sm text-muted">
          Generate an MD5 hash from text input. MD5 is not secure for password storage.
        </p>
        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-foreground">Input Text</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={6}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand"
            placeholder="Type or paste text..."
          />
        </label>
        <div className="mt-3 rounded-lg border border-line bg-white p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">MD5 Hash</p>
          <p className="mt-1 break-all font-mono text-foreground">{hash}</p>
        </div>
        {isLikelyWeakInput(input) ? (
          <p className="mt-3 rounded-md bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">
            Weak input detected. Avoid MD5 and weak passwords in production systems.
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">MD5 Verify</h2>
        <p className="mt-2 text-sm text-muted">
          Check whether a text value matches a given MD5 hash.
        </p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Original Text</span>
            <input
              type="text"
              value={verifyInput}
              onChange={(event) => setVerifyInput(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              placeholder="Enter original text..."
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">MD5 Hash</span>
            <input
              type="text"
              value={verifyHash}
              onChange={(event) => setVerifyHash(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 font-mono text-sm outline-none transition focus:border-brand"
              placeholder="32-char MD5 hash..."
            />
          </label>
        </div>
        <div className="mt-4 rounded-lg border border-line bg-white p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Computed Hash</p>
          <p className="mt-1 break-all font-mono">{verifyComputed}</p>
        </div>
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
            verifyHash.trim().length === 0
              ? "bg-slate-100 text-slate-700"
              : verifyOk
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
          }`}
        >
          {verifyHash.trim().length === 0
            ? "Enter a hash to verify."
            : verifyOk
              ? "Match: text and hash are consistent."
              : "Not a match."}
        </p>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:col-span-2 sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Weak Hash Lookup</h2>
        <p className="mt-2 text-sm text-muted">
          Check whether an MD5 hash matches a local weak-password dictionary ({COMMON_WEAK_PASSWORDS.length} entries).
          This is a safety audit helper, not a decryption service.
        </p>
        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-foreground">MD5 Hash</span>
          <input
            type="text"
            value={lookupHash}
            onChange={(event) => setLookupHash(event.target.value)}
            className="h-10 rounded-lg border border-line bg-white px-2 font-mono text-sm outline-none transition focus:border-brand"
            placeholder="Enter 32-char MD5 hash..."
          />
        </label>
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
            normalizedLookupHash.length === 0
              ? "bg-slate-100 text-slate-700"
              : !isLookupHashValid
                ? "bg-amber-100 text-amber-800"
                : lookupResult
                  ? "bg-rose-100 text-rose-800"
                  : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {normalizedLookupHash.length === 0
            ? "Enter an MD5 hash to check weak-password matches."
            : !isLookupHashValid
              ? "Invalid MD5 format. Please use a 32-character hex hash."
              : lookupResult
                ? `Match found in weak dictionary: "${lookupResult}"`
                : "No match in local weak dictionary."}
        </p>
      </div>
    </section>
  );
}
