import { create } from "zustand";
import type { Chapter } from "./path";

// The one choreography signal both worlds subscribe to: which chapter is
// active and which micro-beat item within it, plus the scroll direction so
// transitions can play forward/backward. Written each frame by ChapterDriver
// (DescentCanvas) from the same damped offset the camera uses. Discrete only —
// continuous per-frame values ride CSS variables, not React.
export const useChapterStore = create<{
  chapter: Chapter["id"] | null;
  item: number;
  dir: 1 | -1;
}>(() => ({ chapter: null, item: 0, dir: 1 }));
