import { getAuthServer } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export async function GET(request: Request) {
  const auth = await getAuthServer();
  const { GET: getHandler } = toNextJsHandler(auth);
  return getHandler(request);
}

export async function POST(request: Request) {
  const auth = await getAuthServer();
  const { POST: postHandler } = toNextJsHandler(auth);
  return postHandler(request);
}
