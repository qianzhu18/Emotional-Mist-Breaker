import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = "请先完成登录授权"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "无权限访问此资源"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "资源不存在"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}
