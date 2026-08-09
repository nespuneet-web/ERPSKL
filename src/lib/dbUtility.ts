import { supabase } from './supabase';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPSERT' | 'READ';
  tableName: string;
  recordId: string;
  username: string;
  role: string;
  details: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface DbResponse<T = any> {
  success: boolean;
  data?: T | null;
  message: string;
  error?: string;
  count?: number;
}

const AUDIT_LOGS_KEY = 'school_erp_audit_logs_v1';

/**
 * Log activity locally and in Supabase `audit_logs` table
 */
export async function logDatabaseActivity(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
  const logItem: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };

  // 1. Save to Local Storage for immediate client-side tracking & offline resilience
  try {
    const existingStr = localStorage.getItem(AUDIT_LOGS_KEY);
    const existing: AuditLogEntry[] = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift(logItem);
    // Keep max 500 logs locally
    if (existing.length > 500) existing.length = 500;
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('Failed to save audit log to localStorage:', err);
  }

  // 2. Sync to Supabase `audit_logs` table if client is available
  if (supabase) {
    try {
      await supabase.from('audit_logs').insert([{
        id: logItem.id,
        user_name: logItem.username,
        user_role: logItem.role,
        action: logItem.action,
        table_name: logItem.tableName,
        record_id: logItem.recordId,
        details: typeof logItem.details === 'string' ? logItem.details : JSON.stringify(logItem.details),
        status: logItem.status,
        created_at: logItem.timestamp
      }]);
    } catch (e) {
      console.warn('Audit log Supabase push skipped:', e);
    }
  }

  return logItem;
}

/**
 * Get all Audit Logs from Supabase or localStorage fallback
 */
export async function getAuditLogs(tableName?: string): Promise<AuditLogEntry[]> {
  if (supabase) {
    try {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (tableName) {
        query = query.eq('table_name', tableName);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          timestamp: row.created_at,
          action: row.action,
          tableName: row.table_name,
          recordId: row.record_id,
          username: row.user_name || 'System User',
          role: row.user_role || 'Admin',
          details: row.details,
          status: row.status || 'SUCCESS'
        }));
      }
    } catch (e) {
      console.warn('Fetching audit logs from Supabase failed, using local storage:', e);
    }
  }

  // Fallback to local storage
  try {
    const localStr = localStorage.getItem(AUDIT_LOGS_KEY);
    if (localStr) {
      const logs: AuditLogEntry[] = JSON.parse(localStr);
      if (tableName) {
        return logs.filter((l) => l.tableName === tableName);
      }
      return logs;
    }
  } catch (e) {
    console.error('Local audit logs read error:', e);
  }

  return [];
}

/**
 * Standardized READ Operation
 */
export async function fetchRecords<T = any>(
  tableName: string,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<DbResponse<T[]>> {
  if (!supabase) {
    return {
      success: false,
      data: null,
      message: 'Supabase client is not configured.'
    };
  }

  try {
    let query = supabase.from(tableName).select(options?.select || '*');

    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          query = query.eq(key, val);
        }
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        data: null,
        error: error.message,
        message: `Error fetching from ${tableName}: ${error.message}`
      };
    }

    return {
      success: true,
      data: data as T[],
      message: `Successfully fetched ${data?.length || 0} records from ${tableName}.`
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err.message,
      message: `Exception during fetch from ${tableName}: ${err.message}`
    };
  }
}

/**
 * Standardized CREATE Operation
 */
export async function createRecord<T = any>(
  tableName: string,
  recordData: Record<string, any>,
  userContext?: { username?: string; role?: string },
  idColumn: string = 'id'
): Promise<DbResponse<T>> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client is not configured.'
    };
  }

  const username = userContext?.username || 'System User';
  const role = userContext?.role || 'Admin';

  try {
    const { data, error } = await supabase.from(tableName).insert([recordData]).select();

    if (error) {
      await logDatabaseActivity({
        username,
        role,
        action: 'CREATE',
        tableName,
        recordId: recordData[idColumn] || 'unknown',
        details: `Failed to insert record: ${error.message}`,
        status: 'FAILED'
      });

      return {
        success: false,
        error: error.message,
        message: `Failed to insert record into ${tableName}: ${error.message}`
      };
    }

    const createdRecord = data && data[0] ? data[0] : recordData;
    const recId = createdRecord[idColumn] || recordData[idColumn] || 'new';

    await logDatabaseActivity({
      username,
      role,
      action: 'CREATE',
      tableName,
      recordId: String(recId),
      details: `Created record in ${tableName}: ${JSON.stringify(recordData).substring(0, 150)}`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      data: createdRecord as T,
      message: `🟢 Record inserted successfully into ${tableName}!`
    };
  } catch (err: any) {
    await logDatabaseActivity({
      username,
      role,
      action: 'CREATE',
      tableName,
      recordId: recordData[idColumn] || 'unknown',
      details: `Exception: ${err.message}`,
      status: 'FAILED'
    });

    return {
      success: false,
      error: err.message,
      message: `Exception creating record in ${tableName}: ${err.message}`
    };
  }
}

/**
 * Standardized UPDATE Operation
 */
export async function updateRecord<T = any>(
  tableName: string,
  id: string | number,
  recordData: Record<string, any>,
  userContext?: { username?: string; role?: string },
  idColumn: string = 'id'
): Promise<DbResponse<T>> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client is not configured.'
    };
  }

  const username = userContext?.username || 'System User';
  const role = userContext?.role || 'Admin';

  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(recordData)
      .eq(idColumn, id)
      .select();

    if (error) {
      await logDatabaseActivity({
        username,
        role,
        action: 'UPDATE',
        tableName,
        recordId: String(id),
        details: `Failed update: ${error.message}`,
        status: 'FAILED'
      });

      return {
        success: false,
        error: error.message,
        message: `Failed to update record ${id} in ${tableName}: ${error.message}`
      };
    }

    const updatedRecord = data && data[0] ? data[0] : { [idColumn]: id, ...recordData };

    await logDatabaseActivity({
      username,
      role,
      action: 'UPDATE',
      tableName,
      recordId: String(id),
      details: `Updated fields in ${tableName}: ${Object.keys(recordData).join(', ')}`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      data: updatedRecord as T,
      message: `🟢 Record ${id} updated in ${tableName}!`
    };
  } catch (err: any) {
    await logDatabaseActivity({
      username,
      role,
      action: 'UPDATE',
      tableName,
      recordId: String(id),
      details: `Exception during update: ${err.message}`,
      status: 'FAILED'
    });

    return {
      success: false,
      error: err.message,
      message: `Exception updating record in ${tableName}: ${err.message}`
    };
  }
}

/**
 * Standardized UPSERT Operation
 */
export async function upsertRecord<T = any>(
  tableName: string,
  recordData: Record<string, any>,
  conflictColumn: string = 'id',
  userContext?: { username?: string; role?: string }
): Promise<DbResponse<T>> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client is not configured.'
    };
  }

  const username = userContext?.username || 'System User';
  const role = userContext?.role || 'Admin';
  const recId = String(recordData[conflictColumn] || recordData.id || 'unknown');

  try {
    const { data, error } = await supabase
      .from(tableName)
      .upsert([recordData], { onConflict: conflictColumn })
      .select();

    if (error) {
      await logDatabaseActivity({
        username,
        role,
        action: 'UPSERT',
        tableName,
        recordId: recId,
        details: `Failed upsert: ${error.message}`,
        status: 'FAILED'
      });

      return {
        success: false,
        error: error.message,
        message: `Upsert failed for ${tableName}: ${error.message}`
      };
    }

    const resultRecord = data && data[0] ? data[0] : recordData;

    await logDatabaseActivity({
      username,
      role,
      action: 'UPSERT',
      tableName,
      recordId: recId,
      details: `Upserted record into ${tableName}`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      data: resultRecord as T,
      message: `🟢 Record ${recId} synced with ${tableName}!`
    };
  } catch (err: any) {
    await logDatabaseActivity({
      username,
      role,
      action: 'UPSERT',
      tableName,
      recordId: recId,
      details: `Exception during upsert: ${err.message}`,
      status: 'FAILED'
    });

    return {
      success: false,
      error: err.message,
      message: `Exception upserting record in ${tableName}: ${err.message}`
    };
  }
}

/**
 * Standardized DELETE Operation
 */
export async function deleteRecord(
  tableName: string,
  id: string | number,
  userContext?: { username?: string; role?: string },
  idColumn: string = 'id'
): Promise<DbResponse<void>> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client is not configured.'
    };
  }

  const username = userContext?.username || 'System User';
  const role = userContext?.role || 'Admin';

  try {
    const { error } = await supabase.from(tableName).delete().eq(idColumn, id);

    if (error) {
      await logDatabaseActivity({
        username,
        role,
        action: 'DELETE',
        tableName,
        recordId: String(id),
        details: `Delete error: ${error.message}`,
        status: 'FAILED'
      });

      return {
        success: false,
        error: error.message,
        message: `Failed to delete record ${id} from ${tableName}: ${error.message}`
      };
    }

    await logDatabaseActivity({
      username,
      role,
      action: 'DELETE',
      tableName,
      recordId: String(id),
      details: `Deleted record ${id} from ${tableName}`,
      status: 'SUCCESS'
    });

    return {
      success: true,
      message: `🟢 Record ${id} deleted from ${tableName}.`
    };
  } catch (err: any) {
    await logDatabaseActivity({
      username,
      role,
      action: 'DELETE',
      tableName,
      recordId: String(id),
      details: `Exception during deletion: ${err.message}`,
      status: 'FAILED'
    });

    return {
      success: false,
      error: err.message,
      message: `Exception deleting record from ${tableName}: ${err.message}`
    };
  }
}
