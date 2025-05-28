import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(
  request: Request
): Promise<Response> {
  const context = getContext();
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Log incoming requests
  console.log(`[SSR] Handling request for: ${pathname}`);

  // Handle root redirect
  if (pathname === '/') {
    return Response.redirect(`${url.origin}/ar`, 302);
  }

  // Handle language routes
  const langMatch = pathname.match(/^\/(ar|en)/);
  if (!langMatch) {
    console.log(`[SSR] No language prefix found in: ${pathname}`);
    return Response.redirect(`${url.origin}/ar${pathname}`, 302);
  }

  const result = await angularAppEngine.handle(request, context);
  if (!result) {
    console.log(`[SSR] No result for: ${pathname}`);
    return new Response('Not found', { status: 404 });
  }

  return result;
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
