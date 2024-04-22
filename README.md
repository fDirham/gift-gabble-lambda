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

- We'll use webpack to bundle everything together to zip and upload to aws lambda
