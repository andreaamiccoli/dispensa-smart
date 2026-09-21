import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useShoppingList() {
  const items = useLiveQuery(async () => {
    return await db.shoppingList.toArray();
  }, []);

  const activeItems = (items || []).filter(i => !i.checked);
  const completedItems = (items || []).filter(i => i.checked);

  return {
    items: items || [],
    activeItems,
    completedItems,
    totalActiveCount: activeItems.length,
    isLoading: items === undefined,
  };
}
