// Illustrazioni SVG delle scarpe (vista laterale), generate dal colore del prodotto.

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [n >> 16, (n >> 8) & 255, n & 255].map((c) =>
    Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))));
  return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('');
}

const SHAPES = {
  pump: (c) => `
    <path d="M316 212 L340 200 L331 306 L322 306 Z" fill="${c.dark}"/>
    <path d="M52 296 C48 276 70 262 110 258 C150 254 182 262 212 250 C246 236 270 204 292 186 C304 176 322 172 336 178 C344 182 344 194 340 204 L334 214 C316 230 290 252 262 274 C238 292 210 302 176 304 L72 304 C60 304 54 302 52 296 Z" fill="${c.base}"/>
    <path d="M140 258 C190 262 240 236 290 192 C300 186 312 184 324 188 C300 198 262 236 226 252 C198 264 168 264 140 258 Z" fill="${c.inner}"/>
    <path d="M60 302 L176 302 C210 300 238 290 262 274 L334 214" fill="none" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>`,
  slingback: (c) => `
    <path d="M314 212 L338 202 L331 306 L320 306 Z" fill="${c.dark}"/>
    <path d="M246 234 C272 220 302 202 332 196 L336 212 C318 230 292 252 262 274 Z" fill="${c.inner}"/>
    <path d="M52 296 C48 276 70 262 110 258 C150 254 182 262 212 250 C226 244 236 240 246 234 L262 274 C238 292 210 302 176 304 L72 304 C60 304 54 302 52 296 Z" fill="${c.base}"/>
    <path d="M252 236 C278 210 312 184 340 184" fill="none" stroke="${c.base}" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 302 L176 302 C210 300 238 290 262 274 L336 212" fill="none" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>`,
  loafer: (c) => `
    <path d="M298 300 L356 300 L356 322 L302 322 Z" fill="${c.sole}"/>
    <path d="M46 300 L358 300 L358 310 C358 314 354 316 350 316 L60 316 C50 316 46 312 46 306 Z" fill="${c.sole}"/>
    <path d="M44 298 C42 270 70 254 120 248 C150 244 170 236 196 232 L300 226 C334 224 352 238 356 262 L358 296 C358 304 352 308 344 308 L58 308 C50 308 45 305 44 298 Z" fill="${c.base}"/>
    <path d="M196 232 C230 238 270 236 300 226 C290 240 240 246 200 242 Z" fill="${c.inner}"/>
    <path d="M112 262 C146 252 180 250 214 256" fill="none" stroke="${c.light}" stroke-width="6" stroke-linecap="round"/>
    <path d="M150 268 L176 266" stroke="${c.dark}" stroke-width="4" stroke-linecap="round"/>`,
  boot: (c) => `
    <path d="M294 306 L346 306 L342 336 L300 336 Z" fill="${c.sole}"/>
    <path d="M50 300 L348 300 L348 312 L56 312 Z" fill="${c.sole}"/>
    <path d="M48 296 C46 270 72 258 118 252 C160 248 190 240 208 222 L214 120 L322 118 C326 170 330 220 342 260 L348 296 C348 306 342 310 334 310 L62 310 C52 310 48 304 48 296 Z" fill="${c.base}"/>
    <path d="M214 120 C250 110 290 110 322 118 C290 128 250 128 214 120 Z" fill="${c.inner}"/>
    <path d="M300 130 L304 250" stroke="${c.dark}" stroke-width="3" stroke-dasharray="2 5"/>`,
  tallboot: (c) => `
    <path d="M294 306 L346 306 L342 336 L300 336 Z" fill="${c.sole}"/>
    <path d="M50 300 L348 300 L348 312 L56 312 Z" fill="${c.sole}"/>
    <path d="M48 296 C46 270 72 258 118 252 C160 248 190 240 206 222 L218 46 L320 40 C318 120 326 210 342 260 L348 296 C348 306 342 310 334 310 L62 310 C52 310 48 304 48 296 Z" fill="${c.base}"/>
    <path d="M218 46 C252 34 290 32 320 40 C290 52 252 54 218 46 Z" fill="${c.inner}"/>
    <path d="M230 120 C260 116 290 116 316 120" fill="none" stroke="${c.light}" stroke-width="3" opacity=".6"/>`,
  sneaker: (c) => `
    <path d="M40 284 C42 254 76 240 126 236 C160 232 186 210 214 200 L318 196 C350 196 362 220 364 250 L366 284 Z" fill="${c.base}" stroke="${c.line}" stroke-width="2"/>
    <path d="M214 200 C244 196 290 194 318 196 C300 206 250 210 220 208 Z" fill="${c.inner}"/>
    <path d="M150 238 L176 222 M162 246 L190 228 M176 252 L204 234" stroke="${c.line}" stroke-width="4" stroke-linecap="round"/>
    <path d="M330 200 C346 214 352 236 352 262" fill="none" stroke="${c.line}" stroke-width="3"/>
    <path d="M34 282 L368 282 C373 282 375 287 375 292 L373 306 C372 312 368 316 362 316 L50 316 C40 316 34 310 34 300 Z" fill="#e7e2d9" stroke="${c.line}" stroke-width="2"/>
    <path d="M44 300 L366 300" stroke="${c.line}" stroke-width="2" stroke-dasharray="6 6"/>`,
  ballerina: (c) => `
    <path d="M46 302 L356 302 L356 310 C356 314 352 316 348 316 L60 316 C50 316 46 312 46 308 Z" fill="${c.sole}"/>
    <path d="M44 300 C42 282 66 270 110 266 C150 262 200 262 240 258 L320 252 C346 250 356 266 356 284 L356 300 C356 306 350 310 342 310 L56 310 C48 310 44 306 44 300 Z" fill="${c.base}"/>
    <path d="M150 266 C200 262 260 258 322 252 C300 264 220 272 150 266 Z" fill="${c.inner}"/>
    <ellipse cx="128" cy="262" rx="16" ry="9" fill="${c.light}"/><ellipse cx="160" cy="262" rx="16" ry="9" fill="${c.light}"/><circle cx="144" cy="263" r="6" fill="${c.base}"/>`,
  mule: (c) => `
    <path d="M312 246 L340 236 L336 306 L318 306 Z" fill="${c.dark}"/>
    <path d="M226 234 C268 240 310 242 342 234 L340 250 C304 270 270 290 236 302 Z" fill="${c.inner}"/>
    <path d="M52 296 C48 274 72 260 112 254 C160 248 196 240 228 232 L238 302 L72 304 C60 304 54 302 52 296 Z" fill="${c.base}"/>
    <path d="M60 302 L238 302 C270 290 304 270 340 250" fill="none" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>`,
  sandal: (c) => `
    <path d="M56 300 L340 290" stroke="${c.dark}" stroke-width="10" stroke-linecap="round"/>
    <path d="M100 296 C120 250 170 250 190 294 M220 292 C240 240 290 240 310 290" fill="none" stroke="${c.base}" stroke-width="14"/>`,
};

export function shoeSvg(shape, hex, label) {
  const light = parseInt(hex.slice(1, 3), 16) > 200;
  const c = {
    base: hex,
    dark: shade(hex, light ? -0.35 : -0.45),
    inner: shade(hex, light ? -0.18 : 0.18),
    light: shade(hex, 0.25),
    sole: light ? '#3a3330' : shade(hex, -0.6),
    line: light ? '#c9c1b5' : shade(hex, -0.3),
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${label}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe8"/><stop offset="1" stop-color="#e8e1d6"/></linearGradient></defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <g transform="translate(0 -22)">
  <ellipse cx="204" cy="330" rx="170" ry="10" fill="#000" opacity=".07"/>
  ${SHAPES[shape](c)}
  </g>
</svg>
`;
}
