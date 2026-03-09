"use client";

import { Violation } from "@/lib/types";

interface Props {
  violations: Violation[];
}

export default function ViolationsBanner({ violations }: Props) {
  return (
    <div className="mt-4 rounded-2xl border border-down/20 bg-down-dim p-5 animate-slide-up stagger-2">
      <div className="flex items-start gap-3.5">
        <div className="w-6 h-6 rounded-full bg-down/20 border border-down/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-down text-xs font-bold">!</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-down mb-2.5">
            {violations.length} Rule Violation{violations.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {violations.map((v, i) => (
              <p key={i} className="text-sm text-surface-700 leading-relaxed">
                <span className="font-semibold text-surface-900">{v.label}</span>
                {" "}is <span className="font-mono text-down tabular-nums">{v.currentWeight.toFixed(1)}%</span> of
                your portfolio — exceeds the {v.limit}% {v.type} limit
                by <span className="font-mono text-down tabular-nums">{v.overage.toFixed(1)}%</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
