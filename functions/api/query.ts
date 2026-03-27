export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const mark_code = body.mark_code;
    
    if (!mark_code) {
      return Response.json({ error: "mark_code is required" }, { status: 400 });
    }

    // 检查是否绑定了 D1 数据库
    if (!env.DB) {
      return Response.json({ error: "Cloudflare D1 Database binding 'DB' not found." }, { status: 500 });
    }

    // 处理“分割”和“模糊”查询：将用户输入按空格分割成多个关键词
    const keywords = mark_code.trim().split(/\s+/).filter(Boolean);
    
    if (keywords.length === 0) {
      return Response.json({ success: true, result: [{ results: [] }] });
    }

    // 构建 SQL 语句，例如：SELECT * FROM qdrs WHERE mark_code LIKE ? AND mark_code LIKE ?
    const conditions = keywords.map(() => "mark_code LIKE ?").join(" AND ");
    const query = `SELECT * FROM qdrs WHERE ${conditions}`;
    
    // 构建绑定的参数数组，例如：['%关键词1%', '%关键词2%']
    const bindParams = keywords.map((kw: string) => `%${kw}%`);

    // 执行 D1 数据库查询
    const stmt = env.DB.prepare(query);
    const { results } = await stmt.bind(...bindParams).all();

    return Response.json({ success: true, result: [{ results }] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
