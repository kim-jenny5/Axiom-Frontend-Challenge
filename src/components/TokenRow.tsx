import { memo } from 'react';
import type { Token } from '../types';
import { formatUsd, formatPct } from '../format';

interface TokenRowProps {
	token: Token;
	selected: boolean;
	onSelect: (id: string) => void;
}

export const TokenRow = memo(function TokenRow({
	token,
	selected,
	onSelect
}: TokenRowProps) {
	const changeClass = token.priceChangePct >= 0 ? 'up' : 'down';

	return (
		<div
			className={`row${selected ? ' row--selected' : ''}`}
			onClick={() => onSelect(token.id)}
		>
			<div className='row__token'>
				<span className='row__name'>{token.name}</span>
				<span className='row__ticker'>{token.ticker}</span>
			</div>
			<div className='num'>{formatUsd(token.priceUsd)}</div>
			<div className='num col--hide-mobile'>
				{formatUsd(token.marketCapUsd)}
			</div>
			<div className='num col--hide-mobile'>
				{formatUsd(token.volume24hUsd)}
			</div>
			<div className='num col--hide-mobile'>
				{formatUsd(token.liquidityUsd)}
			</div>
			<div className={`num ${changeClass}`}>
				{formatPct(token.priceChangePct)}
			</div>
		</div>
	);
});
