const { getPool } = require('../config/db');
const { cacheGet, cacheSet, invalidateAgentCaches } = require('../utils/cache');

function mapAgent(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    serviceArea: row.service_area,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function listCacheKey({ page, limit, search, status }) {
  return `agents:list:${JSON.stringify({ page, limit, search, status })}`;
}

async function listAgents(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = String(req.query.search || '').trim();
    const status = req.query.status || '';
    const key = listCacheKey({ page, limit, search, status });
    const cached = await cacheGet(key);
    if (cached) return res.json({ success: true, source: 'cache', ...cached });

    const pool = getPool();
    const where = [];
    const params = [];
    if (status) { where.push('status = ?'); params.push(status); }
    if (search) {
      where.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR service_area LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM agents ${clause}`, params);
    const total = Number(countRows[0].total);
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT id, full_name, phone, email, service_area, status, created_at, updated_at
       FROM agents ${clause} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const payload = {
      data: rows.map(mapAgent),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
    await cacheSet(key, payload, 60);
    return res.json({ success: true, source: 'database', ...payload });
  } catch (error) { next(error); }
}

async function getAgent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const key = `agents:item:${id}`;
    const cached = await cacheGet(key);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const [rows] = await getPool().execute(
      `SELECT id, full_name, phone, email, service_area, status, created_at, updated_at FROM agents WHERE id = ?`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: { code: 'AGENT_NOT_FOUND', message: `Agent ${id} was not found` } });
    }
    const agent = mapAgent(rows[0]);
    await cacheSet(key, agent, 120);
    return res.json({ success: true, source: 'database', data: agent });
  } catch (error) { next(error); }
}

async function createAgent(req, res, next) {
  try {
    const { fullName, phone, email, serviceArea, status = 'active' } = req.body;
    const [result] = await getPool().execute(
      'INSERT INTO agents (full_name, phone, email, service_area, status) VALUES (?, ?, ?, ?, ?)',
      [fullName.trim(), phone.trim(), email.trim().toLowerCase(), serviceArea.trim(), status]
    );
    await invalidateAgentCaches();
    const [rows] = await getPool().execute(
      'SELECT id, full_name, phone, email, service_area, status, created_at, updated_at FROM agents WHERE id = ?',
      [result.insertId]
    );
    return res.status(201).json({ success: true, data: mapAgent(rows[0]) });
  } catch (error) { next(error); }
}

async function updateAgent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const fieldMap = {
      fullName: 'full_name', phone: 'phone', email: 'email',
      serviceArea: 'service_area', status: 'status'
    };
    const [existing] = await getPool().execute('SELECT id FROM agents WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, error: { code: 'AGENT_NOT_FOUND', message: `Agent ${id} was not found` } });
    }

    const keys = Object.keys(req.body);
    const assignments = keys.map((key) => `${fieldMap[key]} = ?`);
    const values = keys.map((key) => {
      const value = req.body[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return key === 'email' ? trimmed.toLowerCase() : trimmed;
      }
      return value;
    });
    await getPool().execute(`UPDATE agents SET ${assignments.join(', ')} WHERE id = ?`, [...values, id]);
    await invalidateAgentCaches();

    const [rows] = await getPool().execute(
      'SELECT id, full_name, phone, email, service_area, status, created_at, updated_at FROM agents WHERE id = ?',
      [id]
    );
    return res.json({ success: true, data: mapAgent(rows[0]) });
  } catch (error) { next(error); }
}

async function deleteAgent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [result] = await getPool().execute('DELETE FROM agents WHERE id = ?', [id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, error: { code: 'AGENT_NOT_FOUND', message: `Agent ${id} was not found` } });
    }
    await invalidateAgentCaches();
    return res.status(204).end();
  } catch (error) { next(error); }
}

async function getStats(req, res, next) {
  try {
    const [rows] = await getPool().execute(
      `SELECT COUNT(*) AS total,
       SUM(status = 'active') AS active,
       SUM(status = 'inactive') AS inactive
       FROM agents`
    );
    return res.json({
      success: true,
      data: { total: Number(rows[0].total), active: Number(rows[0].active || 0), inactive: Number(rows[0].inactive || 0) }
    });
  } catch (error) { next(error); }
}

module.exports = { listAgents, getAgent, createAgent, updateAgent, deleteAgent, getStats };
