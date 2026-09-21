import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function usePantryItems(searchQuery = '', selectedCategory = '') {
  const items = useLiveQuery(async () => {
    let collection = db.pantryItems.orderBy('name');
    let allItems = await collection.toArray();

    if (selectedCategory && selectedCategory !== 'ALL') {
      allItems = allItems.filter(i => i.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      allItems = allItems.filter(i => i.name.toLowerCase().includes(q));
    }

    return allItems;
  }, [searchQuery, selectedCategory]);

  return {
    items: items || [],
    isLoading: items === undefined,
  };
}
