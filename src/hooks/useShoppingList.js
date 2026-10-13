import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useShoppingList() {
  const data = useLiveQuery(async () => {
    const [sItems, pItems] = await Promise.all([
      db.shoppingList.toArray(),
      db.pantryItems.toArray(),
    ]);

    const pantryMap = new Map(pItems.map((p) => [p.id, p]));

    return sItems.map((item) => {
      let resolvedCategory = item.category;
      if (!resolvedCategory && item.pantryItemId && pantryMap.has(item.pantryItemId)) {
        resolvedCategory = pantryMap.get(item.pantryItemId).category;
      }
      return {
        ...item,
        category: resolvedCategory || 'Altro',
      };
    });
  }, []);

  const activeItems = (data || []).filter(i => !i.checked);
  const completedItems = (data || []).filter(i => i.checked);

  return {
    items: data || [],
    activeItems,
    completedItems,
    totalActiveCount: activeItems.length,
    isLoading: data === undefined,
  };
}
