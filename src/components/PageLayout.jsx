import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Global storefront layout — same Header & Footer on every public page.
 * Pass searchQuery/setSearchQuery when the page filters by search (Home, Menu, Blog).
 */
export default function PageLayout({
  children,
  searchQuery: controlledQuery,
  setSearchQuery: controlledSetQuery,
  showSearch = true,
  mainClassName = '',
}) {
  const [localQuery, setLocalQuery] = useState('');
  const searchQuery = controlledQuery ?? localQuery;
  const setSearchQuery = controlledSetQuery ?? setLocalQuery;

  return (
    <div className="bg-slate-200 min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} showSearch={showSearch} />
      <main className={`flex-1 w-full ${mainClassName}`}>{children}</main>
      <Footer />
    </div>
  );
}
