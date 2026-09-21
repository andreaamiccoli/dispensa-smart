import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useCategories() {
  const categories = useLiveQuery(async () => {
    return await db.categories.orderBy('order').toArray();
  }, []);

  const addCategory = async (name, colorTag = '#6b7280') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const count = await db.categories.count();
    return db.categories.add({
      name: trimmed,
      colorTag,
      order: count + 1,
    });
  };

  const deleteCategory = async (id) => {
    return db.categories.delete(id);
  };

  return {
    categories: categories || [],
    isLoading: categories === undefined,
    addCategory,
    deleteCategory,
  };
}
