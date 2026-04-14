'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FaqRow key={item.q} {...item} />
      ))}
    </div>
  );
}

function FaqRow({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 md:text-base">{q}</span>
        <FiChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="border-t border-gray-50 px-5 pb-5">
          <p className="pt-3 text-sm leading-relaxed text-gray-600">{a}</p>
        </div>
      ) : null}
    </div>
  );
}
