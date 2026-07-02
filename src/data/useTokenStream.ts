import { useEffect } from 'react';
import type { Token } from '../types';
import { tokenStore } from './tokenStore';

interface StreamOptions {
	intervalMs: number;
	churn: number;
}

export function useTokenStream({ intervalMs, churn }: StreamOptions): void {
	useEffect(() => {
		const id = setInterval(() => {
			const snapshot = tokenStore.getSnapshot();
			const len = snapshot.length;

			if (len === 0) return;

			const updatesPerTick = Math.floor(len * churn);
			const updates: Token[] = [];

			for (let i = 0; i < updatesPerTick; i++) {
				const index = Math.floor(Math.random() * len);
				const token = snapshot[index];
				const drift = 1 + (Math.random() - 0.5) * 0.08;
				const priceUsd = token.priceUsd * drift;

				updates.push({
					...token,
					priceUsd,
					marketCapUsd: token.marketCapUsd * drift,
					volume24hUsd: token.volume24hUsd * (1 + (Math.random() - 0.5) * 0.1),
					txCount: token.txCount + Math.floor(Math.random() * 50),
					priceChangePct: token.priceChangePct + (drift - 1) * 100
				});
			}

			tokenStore.applyUpdates(updates);
		}, intervalMs);

		return () => clearInterval(id);
	}, [intervalMs, churn]);
}
