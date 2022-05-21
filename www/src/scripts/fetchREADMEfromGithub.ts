import type { Root } from 'mdast';
import { remark } from 'remark';
import parseFrontmatter from 'remark-frontmatter';
import emoji from 'remark-gemoji';
import gfm from 'remark-gfm';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';

const token: string | undefined = import.meta.env.PUBLIC_GITHUB_TOKEN;

if (!token) {
  console.error(
    'Cannot find environment variable "PUBLIC_GITHUB_TOKEN" used for escaping GitHub API rate-limiting.'
  );
}

/**
 * Fetch the README for a GitHub repo based on its URL.
 *
 * Fetches using the GitHub API and applies some custom remark transforms
 * to better handle content written for GitHub:
 * - Deletes any frontmatter
 * - Applies “GitHub-flavoured Markdown” (includes stuff like strikethrough with `~~`)
 * - Enables “Gemoji” (`:rocket:` => 🚀)
 * - Prepends relative links & image sources with the correct absolute base
 */
export default async function fetchREADMEfromGithub(
  repoURL: string
): Promise<string> {
  // Remove trailing slash
  if (repoURL.at(-1) === '/') repoURL = repoURL.slice(0, -1);

  const [, user, repo, rest] = repoURL.match(
    /^https?:\/\/github.com\/([^/]+)\/([^/]+)(.*)/
  );
  const dir = rest ? '/' + rest.split('/').slice(3).join('/') : '';
  const url = `https://api.github.com/repos/${user}/${repo}/readme${dir}`;

  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github.v3.json',
      Authorization:
        token && `Basic ${Buffer.from(token, 'binary').toString('base64')}`,
      'User-Agent': 'Astro-Hackathon-Showcase',
    },
  });

  if (response.status >= 400) {
    console.error(
      `Failed to fetch README for ${user}/${repo}\nError:`,
      response.status,
      response.statusText
    );
    return 'No README found!';
  }

  const { content, download_url, html_url } = await response.json();

  const processor = remark()
    .use(parseFrontmatter)
    .use(stripFrontmatter)
    .use(gfm)
    .use(emoji)
    .use(absoluteImageURLs, { base: stripFilename(download_url) })
    .use(absoluteLinks, { base: stripFilename(html_url) });

  // Parse the Markdown returned by the API which is encoded in base-64
  const md = Buffer.from(content, 'base64').toString('utf-8');

  // Run the Markdown through the remark processing pipeline
  const processedMd = (await processor.process(md)).toString();

  return processedMd;
}

/** Remove the last segment of a URL, kind of like `dirname`. */
function stripFilename(url: string) {
  return url.split('/').slice(0, -1).join('/') + '/';
}

/** Remark plugin to prepend an absolute path in front of image src URLs. */
function absoluteImageURLs({ base }: { base: string }) {
  function visitor(node) {
    // Sanitize URL by removing leading `/`
    const relativeUrl = node.url.replace(/^.?\//, '');
    node.url = new URL(relativeUrl, base).href;
  }

  function transform(tree: Root) {
    visit(tree, 'image', visitor);
  }

  return transform;
}

/** Remark plugin to prepend an absolute path in front of link hrefs. */
function absoluteLinks({ base }: { base: string }) {
  function visitor(node) {
    // Sanitize URL by removing leading `/`
    const relativeUrl = node.url.replace(/^.?\//, '');
    node.url = new URL(relativeUrl, base).href;
  }

  function transform(tree: Root) {
    visit(tree, 'link', visitor);
  }

  return transform;
}

/** Remark plugin to strip frontmatter parsed with `remark-frontmatter`. */
function stripFrontmatter() {
  return function transform(tree: Root) {
    remove(tree, 'yaml');
  };
}
