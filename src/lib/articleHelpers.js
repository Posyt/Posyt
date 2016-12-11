import _ from 'lodash';

export function articleTitle(article) {
  let title = article.title;
  if (!title) title = article.sources && _.compact(article.sources.map(s => s.title))[0];
  if (title) title = title.substring(0, 200);
  return title;
}

export function articleDescription(article) {
  let description = article.description;
  if (!description) description = article.sources && _.compact(article.sources.map(s => s.description))[0];
  if (description) description = description.substring(0, 500);
  return description;
}

export function articleURL(article) {
  return article.url || article.sources && _.compact(article.sources.map(s => s.url))[0];
}

export function articleSources(article) {
  const rootSource = { name: article.source, url: article.url };
  const subSources = (article.sources && article.sources.map(s => s.name && { name: s.name, url: s.url })) || [];
  const sources = _.compact([rootSource, ...subSources]);
  return sources;
}
