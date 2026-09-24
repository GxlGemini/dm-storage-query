export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const mark_code = (body.mark_code || '').trim();
    const capacity = (body.capacity || '').trim();
    
    if (!mark_code && !capacity) {
      return Response.json({ error: "请输入丝印/激光码或选择容量" }, { status: 400 });
    }

    // 检查是否绑定了 D1 数据库
    if (!env.DB) {
      return Response.json({ error: "Cloudflare D1 Database binding 'DB' not found." }, { status: 500 });
    }

    const whereClauses: string[] = [];
    const bindParams: any[] = [];

    // 处理“分割”和“模糊”查询：将用户输入按空格分割成多个关键词
    if (mark_code) {
      const keywords = mark_code.split(/\s+/).filter(Boolean);
      if (keywords.length > 0) {
        const conditions = keywords.map(() => "mark_code LIKE ?").join(" AND ");
        whereClauses.push(`(${conditions})`);
        keywords.forEach((kw: string) => bindParams.push(`%${kw}%`));
      }
    }

    // 处理容量过滤（如果用户选择了特定容量且非全部，兼容 4G 与 4GB 格式）
    if (capacity && capacity !== '全部') {
      const capWithB = capacity.endsWith('B') ? capacity : `${capacity}B`;
      const capWithoutB = capacity.endsWith('B') ? capacity.slice(0, -1) : capacity;
      whereClauses.push("(capacity = ? OR capacity = ?)");
      bindParams.push(capWithoutB, capWithB);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const query = `SELECT * FROM qdrs ${whereSql}`;

    // 执行 D1 数据库查询
    const stmt = env.DB.prepare(query);
    const { results } = await stmt.bind(...bindParams).all();

    return Response.json({ success: true, result: [{ results }] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
