import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { pushLocalDataToCloud } from '../db/syncService';

export function useCategories() {
  const categories = useLiveQuery(async () => {
    return await db.categories.orderBy('order').toArray();
  }, []);

  const addCategory = async (name, colorTag = '#6b7280') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const count = await db.categories.count();
    const id = await db.categories.add({
      name: trimmed,
      colorTag,
      order: count + 1,
    });
    await pushLocalDataToCloud();
    return id;
  };

  const deleteCategory = async (id) => {
    await db.categories.delete(id);
    await pushLocalDataToCloud();
  };

  return {
    categories: categories || [],
    isLoading: categories === undefined,
    addCategory,
    deleteCategory,
  };
}
