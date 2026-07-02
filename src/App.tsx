import { useState, useMemo, useSyncExternalStore } from 'react';
import { useTokenStream } from './data/useTokenStream';
import { tokenStore } from './data/tokenStore';
import { generateTokens } from './data/generateTokens';
import { TokenList } from './components/TokenList';
import { Sidebar } from './components/Sidebar';
import { Controls, type SortKey } from './components/Controls';

const TOKEN_COUNT = 10_000;
const UPDATE_INTERVAL_MS = 500;
const CHURN = 0.3;

tokenStore.seed(generateTokens(TOKEN_COUNT));

export default function App() {
	useTokenStream({ intervalMs: UPDATE_INTERVAL_MS, churn: CHURN });

	const tokens = useSyncExternalStore(
		tokenStore.subscribe,
		tokenStore.getSnapshot
	);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [sortKey, setSortKey] = useState<SortKey>('marketCapUsd');

	const normalizedQuery = query.trim().toLowerCase();

	const sorted = useMemo(() => {
		const list = normalizedQuery
			? tokens.filter(
					(t) =>
						t.name.toLowerCase().includes(normalizedQuery) ||
						t.ticker.toLowerCase().includes(normalizedQuery)
				)
			: tokens.slice();

		return list.sort((a, b) => b[sortKey] - a[sortKey]);
	}, [tokens, normalizedQuery, sortKey]);

	const selectedToken = selectedId
		? (tokenStore.getById(selectedId) ?? null)
		: null;

	return (
		<div className='app'>
			<header className='app__header'>
				<span className='app__title'>AXIOM</span>
				<span className='app__subtitle'>Token Feed</span>
			</header>
			<div className='app__body'>
				<section className='feed'>
					<Controls
						query={query}
						onQueryChange={setQuery}
						sortKey={sortKey}
						onSortKeyChange={setSortKey}
						visibleCount={sorted.length}
						totalCount={tokens.length}
					/>
					<div className='feed__head'>
						<div>Token</div>
						<div className='num'>Price</div>
						<div className='num col--hide-mobile'>Market Cap</div>
						<div className='num col--hide-mobile'>Volume</div>
						<div className='num col--hide-mobile'>Liquidity</div>
						<div className='num'>24h</div>
					</div>
					<TokenList
						tokens={sorted}
						selectedId={selectedId}
						onSelect={setSelectedId}
					/>
				</section>
				<Sidebar token={selectedToken} />
			</div>
		</div>
	);
}
