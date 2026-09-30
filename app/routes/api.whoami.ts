import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';

// The reverse proxy authenticates users and passes the account name in X-Bolt-User.
export async function loader({ request }: LoaderFunctionArgs) {
  return json({ user: request.headers.get('x-bolt-user') || '' });
}
