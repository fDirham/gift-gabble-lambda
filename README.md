The gift gabble API is separate from Next so we can bypass rate limits.
We'll be using AWS lambda for this.

## Notes

- Using pure JS, priority should be to get things up and running
- Use normal npm, not pnpm, to reduce headaches.
- Routes returns response objects in this format:

```
{
    statusCode: number,
    body: object // Later will be JSON stringified obj usually
}
```

- We'll use esbuild to bundle everything together to zip and upload to aws lambda

## How to test

- `npm run dev`

## How to update lambda

- Reference instructions: https://aws.amazon.com/blogs/compute/optimizing-node-js-dependencies-in-aws-lambda/
- Run `npm run build` then zip up contents of .dist folder, then upload to lambda
