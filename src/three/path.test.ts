// ponytail: one self-check for the orbit rig, since the camera framing (it must
// aim at each pad, and reach the house before the door opens), the composed
// beat shots, the chapter plateaus (camera lock), and the flower pop-ins
// (keyed off orbitAngle) all depend on it. Run: `node src/three/path.test.ts`
import assert from "node:assert/strict";
import { orbitAngle, interiorT, chapterAt, roadPoint, roadsidePoint, shotPoint, PLANET, PAD_A, GARDEN_DX, SHED_DX, ARRIVE, DOOR_OPEN, CHAPTERS, INTERIOR, HOUSE } from "./path.ts";

const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;
const ch = (id: string) => CHAPTERS.find((c) => c.id === id)!;

// the orbit hits each pad angle at its chapter
assert(near(orbitAngle(ch("garden").start), PAD_A.garden), "garden angle at chapter start");
assert(near(orbitAngle(ch("workshop").start), PAD_A.workshop), "workshop angle at chapter start");
assert(near(orbitAngle(ARRIVE), 0), "house (angle 0) at arrival");
assert(near(orbitAngle(1), 0), "stays at the house after arrival");

// chapters: ordered, non-overlapping, inside [0,1], with sane item counts
let prevEnd = -1;
for (const c of CHAPTERS) {
  assert(c.start >= 0 && c.end <= 1 && c.start < c.end, `chapter ${c.id} window sane`);
  assert(c.start > prevEnd - 1e-9, `chapter ${c.id} ordered/non-overlapping`);
  assert(c.items >= 1, `chapter ${c.id} has items`);
  prevEnd = c.end;
}
assert(near(ch("driveway").start, ARRIVE), "driveway chapter begins at arrival");

// THE LOCK: orbitAngle is flat across every pre-arrival chapter window, and
// interiorT is flat across the driveway + gallery windows
for (const id of ["garden", "workshop"] as const) {
  const c = ch(id);
  for (let o = c.start; o <= c.end + 1e-9; o += (c.end - c.start) / 20) {
    assert(near(orbitAngle(o), orbitAngle(c.start), 1e-9), `orbitAngle flat in ${id} at o=${o.toFixed(3)}`);
  }
}
for (const id of ["driveway", "gallery"] as const) {
  const c = ch(id);
  for (let o = c.start; o <= c.end + 1e-9; o += (c.end - c.start) / 20) {
    assert(near(interiorT(o), interiorT(c.start), 1e-9), `interiorT flat in ${id} at o=${o.toFixed(3)}`);
  }
}

// chapterAt maps offsets to windows + local progress
assert(chapterAt((ch("garden").start + ch("garden").end) / 2).c?.id === "garden", "chapterAt mid-garden");
assert(near(chapterAt(ch("garden").end).local, 1), "local progress hits 1 at chapter end");
assert(chapterAt((ch("garden").end + ch("workshop").start) / 2).c === null, "travel legs have no chapter");

// interiorT: monotonic 0→1 over [ARRIVE, 1]
let prevT = -1e-9;
for (let o = ARRIVE; o <= 1.0001; o += 0.01) {
  const t = interiorT(o);
  assert(t >= prevT - 1e-9 && t >= 0 && t <= 1, `interiorT monotonic at o=${o.toFixed(2)}`);
  prevT = t;
}
assert(near(interiorT(ARRIVE), 0) && near(interiorT(1), 1), "interiorT endpoints");

// reaches the house BEFORE the door opens (so the interior lands correctly)
assert(ARRIVE < DOOR_OPEN.from, "door opens after arrival");
assert(orbitAngle(DOOR_OPEN.from) === 0, "at the house before the door opens");
// the camera holds at the door (u=0) until the door starts opening
assert(near(interiorT(DOOR_OPEN.from), 0), "camera still at the door when it opens");

// monotonic non-increasing (one way around: garden angle → 0)
let prev = Infinity;
for (let o = 0; o <= 1.0001; o += 0.02) {
  const v = orbitAngle(o);
  assert(v <= prev + 1e-9, `monotonic at o=${o.toFixed(2)}`);
  assert(v >= -1e-9 && v <= PAD_A.garden + 1e-9, `in range at o=${o.toFixed(2)}`);
  prev = v;
}

// roadsidePoint with dx=0 IS the road centreline, and every beat's roadside
// anchor sits flush on the sphere — placement (Roadside) and gaze share this
for (const a of [0, PAD_A.workshop, PAD_A.garden]) {
  const rp = roadPoint(a);
  const rs = roadsidePoint(a, 0);
  assert(near(rp.distanceTo(rs), 0), `roadsidePoint(a,0)===roadPoint at a=${a}`);
}
for (const [a, dx] of [[PAD_A.garden, GARDEN_DX], [PAD_A.workshop, SHED_DX]] as const) {
  assert(near(roadsidePoint(a, dx).distanceTo(PLANET.center), PLANET.R), `beat (${a},${dx}) flush on sphere`);
  assert(near(shotPoint(a, dx, 5).distanceTo(PLANET.center), PLANET.R + 5, 1e-4), `shotPoint (${a},${dx}) at R+h`);
}

// the Pad math guarantee: house pad (tilt 0) via Rot_x(0)·(0,R,6)+center lands
// at the world origin — the whole interior is authored assuming this, so a
// future R/center change that breaks it must fail loudly
assert(near(PLANET.center.x + 0, 0) && near(PLANET.center.y + PLANET.R, 0) && near(PLANET.center.z + 6, 0), "house pad lands at world origin (R-independent interior)");

// the interior flight starts just outside the door plane it hands off to
const entry = INTERIOR.getPoint(0);
assert(entry.z > HOUSE.front && entry.y > 2 && entry.y < 5, "interior starts just outside the door");

console.log("path.test.ts: orbit rig contract OK");
