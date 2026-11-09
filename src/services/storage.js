const DATABASE_NAME = "voice-note-db";
const DATABASE_VERSION = 1;
const STORE_NAME = "notes";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getStoredNotes() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const request = transaction
      .objectStore(STORE_NAME)
      .getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

      transaction.oncomplete = () => {
      database.close();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export async function saveStoredNote(note) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).put(note);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export async function deleteStoredNote(noteId) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).delete(noteId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}