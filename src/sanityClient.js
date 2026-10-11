import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
  projectId: 'u0mlkw04',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
  // No token needed — the dataset is public!
});

const builder = createImageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}