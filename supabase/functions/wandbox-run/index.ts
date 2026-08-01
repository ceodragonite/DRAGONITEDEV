import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LANG_MAP: Record<string, string> = {
  cpp: "gcc-head",
  python: "cpython-head",
  java: "openjdk-head",
  js: "nodejs-head",
  pascal: "fpc-head",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { code, stdin, language } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Code is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const compiler = LANG_MAP[language] || "gcc-head";

    const wandboxReq: Record<string, unknown> = {
      code,
      compiler,
      stdin: stdin || "",
      runtime: true,
    };

    const apiRes = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wandboxReq),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return new Response(JSON.stringify({
        error: `Wandbox API error (${apiRes.status})`,
        detail: errText,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await apiRes.json();

    return new Response(JSON.stringify({
      stdout: result.program_output || result.stdout || "",
      stderr: result.program_error || result.stderr || result.compiler_output || "",
      compilerOutput: result.compiler_output || "",
      compilerError: result.compiler_error || "",
      status: result.status || "unknown",
      signal: result.signal || null,
      url: result.url || null,
      exitCode: result.exit_code ?? null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message || "Internal server error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
