import { DBSchema, IDBPDatabase, openDB } from "idb";
import { CdaItem } from "../types";

const IDX_DB_NAME = "lucascranach";
const IDX_DB_VERSION = 1;

interface DBV1 extends DBSchema {
    "items": { 
        key: number; 
        value: CdaItem;
    }
}

const initDb = (database: IDBPDatabase<DBV1>) => {
    database.createObjectStore("items", {
        keyPath: "objectId"
    });
};

const _db = openDB<DBV1>(IDX_DB_NAME, IDX_DB_VERSION, {
    upgrade(database, oldVersion, _newVersion, _transaction) {
        const v0Db = database as unknown as IDBPDatabase<DBV1>;
        // Remember to not use breaks to leverage fall-through.
        switch(oldVersion) {
            case 0:
                initDb(v0Db);
        }
    },
});

export const saveItems = async (items: CdaItem[]): Promise<number[]> => {
    const db = await _db;
    if(items.length === 0) return [];
    if(items.length === 1) return [await db.add("items", items[0], items[0].objectId)];

    const tx = db.transaction("items", "readwrite");
    const res = await Promise.all(items.map(item => tx.store.add(item)));
    await tx.done;
    return res;
}

export const hasAnyItems = async(): Promise<boolean> => {
    const db = await _db;
    const c = await db.count("items");
    return c > 0;
}

export const getBestOfItems = (): Promise<CdaItem[]> => _db
    .then(db => db.getAll("items"))
    .then(items => items
        .filter(item => item.isBestOf)
        .sort((a, b) => a.sortingNumber.localeCompare(b.sortingNumber)));