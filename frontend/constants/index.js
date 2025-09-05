// constants/index.js
// This file holds global constants that can be imported by any part of the app
// without creating circular dependencies.

// The Canvas environment provides __app_id. We use a fallback if it's not defined.
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// You can add other global constants here later if needed.
export const USER_ID_STORAGE_KEY = 'saralnivesh_user_id';
export const USER_PROGRESS_STORAGE_KEY = 'saralnivesh_user_progress';