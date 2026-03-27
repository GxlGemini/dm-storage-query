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

    // 执行 D1 数据库查询
    const { results } = await env.DB.prepare(
      "SELECT * FROM qdrs WHERE mark_code = ?"
    ).bind(mark_code).all();

    return Response.json({ success: true, result: [{ results }] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
