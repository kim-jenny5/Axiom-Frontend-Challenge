# Notes 📝

---

## 1. Diagnosis

Every 500ms, `useTokenStream` called `setTokens(prev.slice())`. Because `slice()` always returns a new array reference, React re-rendered `App` each time. App ran filter and sort inline with no memoization and passed a fresh array to `TokenList`, which mapped over all 10,000 tokens. 😬 Big oof. `TokenRow` had no memoization, so all 10,000 re-rendered unconditionally, even though only ~300 tokens actually changed.

One `setInterval` tick triggered one `setState`, which triggered one App re-render, which triggered a full list re-render, which triggered 10,000 component re-renders. Repeated every 500ms. 🔁

---

## 2. Solution

- **Move token data out of React state.**

The root problem was that token data lived in React state, so every stream tick forced a re-render. I moved it out into a standalone `tokenStore` that holds all the token data in a Map. The stream now writes updates directly into that Map so React isn't involved at all. Once per animation frame, the store publishes a new snapshot and notifies any components that are listening, which keeps renders capped at 60fps even if the stream fires faster.

Components subscribe to the store using `useSyncExternalStore`. I picked it over Zustand because it's already in React and handles edge cases around concurrent rendering correctly by default.

Last but not least, when the store rebuilds its snapshot, it reuses the same object reference for any token that didn't change. This matters because `React.memo` on `TokenRow` compares props by reference. If the token object is literally the same object in memory as last render, React skips that row entirely.

- **Virtualize the list.**

`TokenList` now uses `@tanstack/react-virtual` to mount only the ~20 rows visible in the viewport instead of all 10,000. A full-height inner div keeps the scrollbar correct. Row height is fixed at 52px (matching `.row { height: 52px }` in the CSS), so no DOM measurement is needed. Rows are keyed by `token.id` rather than position so React reconciles by identity when the sort order changes live.

- **Memoize filter and sort.**

The `useMemo` in App is keyed on `[tokens, normalizedQuery, sortKey]`. With no user input it only recomputes when the store flushes. When the user types or changes sort, it recomputes as expected.

- **Wrap `TokenRow` in `React.memo`.**

With virtualization limiting mounted rows to ~20, memo's job is to ensure only the 2-3 of those whose token actually changed re-render per tick. This works because `onSelect` is `setSelectedId`, `selected` rarely changes, and unchanged token objects are same-reference from the store.

---

## 3. Trade-offs

- **Fixed row height is a hard assumption.**

If rows ever become variable-height, the virtualizer will compute wrong offsets. For the sake of this assessment, I stuck to a hardcoded fix for now.

- **No per-token subscriptions.**

Each `TokenRow` should subscribe only to its own token ID so App never re-renders on a tick at all, but with ~20 mounted rows and `React.memo`, the performance gap is small enough that the added complexity isn't worth it.

---

## 4. What I'd Do Next

- **Delay search input.**

Right now, every single keystroke triggers a filter and sort over 10,000 tokens. Adding a small delay once the user stops typing would make the search feel snappier, especially on slower devices.

- **Freeze sort order between user actions.**

Because the token data changes every 500ms, the list constantly re-ranks and rows jump around, which, in a real feed, is terrible UX. I'd compute the sort order once when the user picks a sort key and only update it again when they explicitly change it, while still letting the individual row values update live.

- **Write price updates directly to the DOM.**

At 60fps updates, even rendering just 20 rows through React starts to add up. Bypassing React entirely for the cells that change most often and updating their text content directly via a ref is probably the next step.
