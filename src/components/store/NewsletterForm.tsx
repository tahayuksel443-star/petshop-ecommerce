'use client';

export default function NewsletterForm() {
  return (
    <form
      className="flex flex-col sm:flex-row max-w-md mx-auto gap-3"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="E-posta adresiniz"
        className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-primary-500 placeholder-gray-500 text-sm"
      />
      <button type="submit" className="btn-primary px-6 py-3 whitespace-nowrap">
        Abone Ol
      </button>
    </form>
  );
}
