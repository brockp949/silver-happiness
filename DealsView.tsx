
import React, { useState, useMemo, useEffect } from 'react';
import type { Deal, CsvRow } from '../types';
import DealCard from './DealCard';
import DealCardCompact from './DealCardCompact';
import DealRow from './DealRow';
import DealDetailView from './DealDetailView';

interface DealsViewProps {
  deals: Deal[];
  originalData: CsvRow[];
}

type ViewMode = 'card' | 'compact' | 'list';
type SelectedDealInfo = { deal: Deal; rowData: CsvRow };

// Helper to parse currency strings into numbers for sorting/filtering
const parseAmount = (amountStr: string): number => {
  if (!amountStr || typeof amountStr !== 'string') return 0;
  return parseFloat(amountStr.replace(/[^0-9.-]+/g, '')) || 0;
};

const sizeFilterOptions = [
  { label: 'All Sizes', value: 'All' },
  { label: '< $1,000', value: '0-1000' },
  { label: '$1,000 - $5,000', value: '1000-5000' },
  { label: '$5,000 - $10,000', value: '5000-10000' },
  { label: '> $10,000', value: '10000-Infinity' },
];

const DealsView: React.FC<DealsViewProps> = ({ deals, originalData }) => {
  const [sortKey, setSortKey] = useState<string>('amount-desc');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [sizeFilter, setSizeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dealsPerPage, setDealsPerPage] = useState<number>(10);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedDeal, setSelectedDeal] = useState<SelectedDealInfo | null>(null);

  const uniqueStages = useMemo(() => {
    const stages = new Set(deals.map(deal => deal.stage));
    return ['All', ...Array.from(stages)];
  }, [deals]);

  const filteredAndSortedDeals = useMemo(() => {
    let processedDeals = [...deals];
    if (stageFilter !== 'All') {
      processedDeals = processedDeals.filter(deal => deal.stage === stageFilter);
    }
    if (sizeFilter !== 'All') {
      const [minStr, maxStr] = sizeFilter.split('-');
      const min = parseFloat(minStr);
      const max = maxStr === 'Infinity' ? Infinity : parseFloat(maxStr);
      processedDeals = processedDeals.filter(deal => {
        const amount = parseAmount(deal.amount);
        return amount >= min && amount < max;
      });
    }
    processedDeals.sort((a, b) => {
      const [key, direction] = sortKey.split('-');
      let valA: string | number = key === 'amount' ? parseAmount(a.amount) : a.dealName.toLowerCase();
      let valB: string | number = key === 'amount' ? parseAmount(b.amount) : b.dealName.toLowerCase();
      if (direction === 'asc') return valA < valB ? -1 : 1;
      return valA > valB ? -1 : 1;
    });
    return processedDeals;
  }, [deals, stageFilter, sizeFilter, sortKey]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [stageFilter, sizeFilter, sortKey, dealsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedDeals.length / dealsPerPage);
  const paginatedDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * dealsPerPage;
    return filteredAndSortedDeals.slice(startIndex, startIndex + dealsPerPage);
  }, [filteredAndSortedDeals, currentPage, dealsPerPage]);
  
  const handleSelectDeal = (deal: Deal) => {
    const rowData = originalData.find(row => parseInt(row.__AI_ROW_ID__, 10) === deal.rowId);
    if (rowData) {
        setSelectedDeal({ deal, rowData });
    } else {
        console.warn(`Could not find original data for deal row ID: ${deal.rowId}`);
        // Fallback: Show detail view without all original data
        setSelectedDeal({ deal, rowData: { Error: `Could not find original data for row ID ${deal.rowId}` }});
    }
  };

  const handleCloseDetailView = () => {
    setSelectedDeal(null);
  };

  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-800/50 rounded-lg mt-6">
        <h3 className="text-xl font-bold text-white">No Deals Found</h3>
        <p className="text-gray-400 mt-2">The AI could not identify any individual deals in the provided data.</p>
      </div>
    );
  }

  const ViewModeButton: React.FC<{mode: ViewMode, children: React.ReactNode}> = ({ mode, children }) => (
    <button onClick={() => setViewMode(mode)} className={`p-2 rounded-md ${viewMode === mode ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
        {children}
    </button>
  );

  const getLayoutClass = () => {
    switch(viewMode) {
      case 'card': return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
      case 'compact': return 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'list': return 'flex flex-col space-y-2';
      default: return '';
    }
  };

  const renderDeal = (deal: Deal) => {
    const key = `${deal.rowId}-${deal.dealName}`;
    switch(viewMode) {
      case 'card': return <DealCard key={key} {...deal} onClick={() => handleSelectDeal(deal)} />;
      case 'compact': return <DealCardCompact key={key} {...deal} onClick={() => handleSelectDeal(deal)} />;
      case 'list': return <DealRow key={key} {...deal} onClick={() => handleSelectDeal(deal)} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in mt-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          <span>Filters & Sort</span>
        </button>
        <div className="flex items-center space-x-1 bg-gray-800 p-1 rounded-lg">
          <ViewModeButton mode="card">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
          </ViewModeButton>
          <ViewModeButton mode="compact">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
          </ViewModeButton>
          <ViewModeButton mode="list">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          </ViewModeButton>
        </div>
      </div>
        
      {isFilterVisible && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end animate-fade-in">
          <div><label htmlFor="sort-key" className="block text-sm font-medium text-gray-300 mb-1">Sort By</label><select id="sort-key" value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm"><option value="dealName-asc">Name (A-Z)</option><option value="dealName-desc">Name (Z-A)</option><option value="amount-desc">Size (High-Low)</option><option value="amount-asc">Size (Low-High)</option></select></div>
          <div><label htmlFor="stage-filter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Stage</label><select id="stage-filter" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm">{uniqueStages.map(stage => <option key={stage} value={stage}>{stage}</option>)}</select></div>
          <div><label htmlFor="size-filter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Size</label><select id="size-filter" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm">{sizeFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
          <div><label htmlFor="deals-per-page" className="block text-sm font-medium text-gray-300 mb-1">Results Per Page</label><select id="deals-per-page" value={dealsPerPage} onChange={(e) => setDealsPerPage(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></div>
        </div>
      )}
      
      {paginatedDeals.length > 0 ? (
        <>
          <div className={getLayoutClass()}>
            {paginatedDeals.map(renderDeal)}
          </div>
          <div className="flex items-center justify-between mt-6 text-sm">
            <p className="text-gray-400">Showing <span className="font-semibold text-white">{(currentPage - 1) * dealsPerPage + 1}</span> to <span className="font-semibold text-white">{Math.min(currentPage * dealsPerPage, filteredAndSortedDeals.length)}</span> of <span className="font-semibold text-white">{filteredAndSortedDeals.length}</span> results</p>
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
              <span className="text-gray-400 px-2">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10 bg-gray-800/50 rounded-lg">
          <h3 className="text-xl font-bold text-white">No Deals Match Your Criteria</h3>
          <p className="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
        </div>
      )}

      {selectedDeal && (
        <DealDetailView deal={selectedDeal.deal} rowData={selectedDeal.rowData} onClose={handleCloseDetailView} />
      )}
    </div>
  );
};

export default DealsView;
