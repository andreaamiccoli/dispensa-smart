import { useLiveQuery } from 'dexie-react-hooks';
import { db, addSubFolder, updateSubFolder, deleteSubFolder } from '../db/database';

export function useSubFolders(category = null, parentSubFolderId = null) {
  const subFolders = useLiveQuery(async () => {
    let collection = db.subFolders;
    let all = await collection.toArray();

    if (category) {
      all = all.filter((f) => f.category === category);
    }

    if (parentSubFolderId !== undefined) {
      all = all.filter((f) => f.parentSubFolderId === (parentSubFolderId ? Number(parentSubFolderId) : null));
    }

    return all;
  }, [category, parentSubFolderId]);

  return {
    subFolders: subFolders || [],
    isLoading: subFolders === undefined,
    addSubFolder,
    updateSubFolder,
    deleteSubFolder,
  };
}
