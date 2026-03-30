import type { IToolMeta } from '../types/tool';

export const TOOLS: IToolMeta[] = [
  {
    name: 'JSON Formatter',
    slug: 'json-formatter',
    description: 'Format, validate, and beautify JSON instantly',
    icon: 'Braces',
    category: 'JSON',
    keywords: ['json formatter', 'json beautifier', 'json validator online', 'format json', 'json pretty print'],
  },
  {
    name: 'JSON Diff',
    slug: 'json-diff',
    description: 'Compare and find differences between JSON objects',
    icon: 'GitCompare',
    category: 'JSON',
    keywords: ['json diff', 'json compare', 'text diff online', 'compare json objects', 'diff checker'],
  },
  {
    name: 'JWT Decoder',
    slug: 'jwt-decoder',
    description: 'Decode and inspect JWT tokens instantly',
    icon: 'KeyRound',
    category: 'Security',
    keywords: ['jwt decoder', 'jwt token decoder', 'decode jwt online', 'jwt debugger', 'jwt parser'],
  },
  {
    name: 'Image Compressor',
    slug: 'image-compressor',
    description: 'Compress images in your browser — no uploads',
    icon: 'ImageDown',
    category: 'Images',
    keywords: ['image compressor', 'compress images online', 'bulk image compressor', 'reduce image size', 'image optimizer'],
  },
];

export const TOOL_CATEGORIES = ['JSON', 'Security', 'Images'] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
