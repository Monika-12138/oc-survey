/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  ADMIN_PASSWORD?: string;
  ADMIN_USERNAME?: string;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const ADMIN_PATH_PREFIXES = ["/admin", "/api/admin"];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function constantTimeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

function readBasicCredentials(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

function hasAdminAccess(request: Request, env: Env): boolean {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return false;
  const credentials = readBasicCredentials(request);
  if (!credentials) return false;

  return (
    constantTimeEqual(credentials.username, env.ADMIN_USERNAME) &&
    constantTimeEqual(credentials.password, env.ADMIN_PASSWORD)
  );
}

function unauthorizedAdminResponse() {
  return new Response("需要管理员账号才能查看答卷。", {
    status: 401,
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Type": "text/plain; charset=utf-8",
      "Cross-Origin-Resource-Policy": "same-origin",
      Vary: "Authorization",
      "WWW-Authenticate": 'Basic realm="OC Survey Admin", charset="UTF-8"',
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function protectAdminResponse(response: Response) {
  const protectedResponse = new Response(response.body, response);
  protectedResponse.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  protectedResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  protectedResponse.headers.set("Vary", "Authorization");
  protectedResponse.headers.set("X-Content-Type-Options", "nosniff");
  return protectedResponse;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (isAdminPath(url.pathname) && !hasAdminAccess(request, env)) {
      return unauthorizedAdminResponse();
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    return isAdminPath(url.pathname) ? protectAdminResponse(response) : response;
  },
};

export default worker;
