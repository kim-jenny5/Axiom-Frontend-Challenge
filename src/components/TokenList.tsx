import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Token } from '../types';
import { TokenRow } from './TokenRow';

const ROW_HEIGHT = 52;
const OVERSCAN = 5;

interface TokenListProps {
	tokens: Token[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}

export function TokenList({ tokens, selectedId, onSelect }: TokenListProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: tokens.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => ROW_HEIGHT,
		overscan: OVERSCAN
	});

	const totalSize = virtualizer.getTotalSize();
	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div ref={parentRef} className='feed__list'>
			<div className='feed__virtual-inner' style={{ height: totalSize }}>
				{virtualItems.map((item) => {
					const token = tokens[item.index];
					return (
						<div
							key={token.id}
							className='feed__virtual-row'
							style={{ transform: `translateY(${item.start}px)` }}
						>
							<TokenRow
								token={token}
								selected={token.id === selectedId}
								onSelect={onSelect}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
