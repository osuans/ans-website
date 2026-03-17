import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'hqlm9lgy',
  dataset: 'production',
  apiVersion: '2026-03-17',
  useCdn: true,
});
