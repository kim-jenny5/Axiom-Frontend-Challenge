import type { Token } from '../types';

class TokenStoreImpl {
	private map = new Map<string, Token>();
	private snapshot: readonly Token[] = [];
	private listeners = new Set<() => void>();
	private rafId: number | null = null;

	seed(tokens: Token[]): void {
		this.map.clear();

		for (const token of tokens) {
			this.map.set(token.id, token);
		}

		this.snapshot = tokens;
		this.notify();
	}

	applyUpdates(updates: Token[]): void {
		for (const token of updates) {
			this.map.set(token.id, token);
		}

		if (this.rafId === null) {
			this.rafId = requestAnimationFrame(() => {
				this.rafId = null;
				this.snapshot = Array.from(this.map.values());
				this.notify();
			});
		}
	}

	private notify(): void {
		for (const listener of this.listeners) {
			listener();
		}
	}

	readonly subscribe = (listener: () => void): (() => void) => {
		this.listeners.add(listener);

		return () => this.listeners.delete(listener);
	};

	readonly getSnapshot = (): readonly Token[] => {
		return this.snapshot;
	};

	getById(id: string): Token | undefined {
		return this.map.get(id);
	}
}

export const tokenStore = new TokenStoreImpl();
