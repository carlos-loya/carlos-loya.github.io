// Adapted from Aceternity UI's Timeline — rethemed to the Muted Slate palette
// (steel-blue beam instead of purple/blue), internal header removed (the
// Experience Section provides it), and unused imports dropped.
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 60%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={containerRef} className="w-full">
      <div ref={ref} className="relative pb-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex min-h-[60vh] justify-start pt-8 md:gap-10"
          >
            <div className="sticky top-24 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-1 flex h-9 w-9 items-center justify-center rounded-full bg-bg md:left-1">
                <div className="h-3 w-3 rounded-full border border-brd bg-panel-2" />
              </div>
              <h3 className="hidden font-mono text-lg font-semibold text-fg-dim md:block md:pl-16 md:text-xl">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-14 pr-2 md:pl-4">
              <h3 className="mb-3 block font-mono text-base font-semibold text-fg-dim md:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        <div
          style={{ height: height + "px" }}
          className="absolute left-5 top-0 w-[2px] overflow-hidden bg-gradient-to-b from-transparent via-brd to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-5"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-accent via-accent-hi to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
