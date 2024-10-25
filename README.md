# Basic Auth Setup

This project is a bit of a playground for me playing around with auth and some other tools.

### Basic features

- [x] Cookie based session auth with access & refresh tokens
- [x] End-to-end, compile-time and run-time type safety
- [x] Input validated forms
- [x] Accessibilty conscious design
- [x] Server side rendering pages + query cache prehydration
- [ ] Email verification
- [ ] Password change
- [ ] User roles
- [ ] Auto generate openapi documentation

Visit a working preview [here](https://trpc-auth-next.vercel.app/).

## 💻 Installation & Setup

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

N.B. To configure the PostgreSQL database, you must [create an account with Neon DB or use a different a different drizzle adapter](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon).

## 🛠️ Tools used:

- Next.js (Pages Router)
- tRPC (type-safety across the network boundary + React Query integration)
- Radix Primitives + Tailwind CSS (accessible UI components)
- Drizzle ORM (type-safe SQL queries)
- PostgreSQL (hosted on Neon)
- React Hook Forms with Zod input validation

## 📝 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs/)
- [Zod Documentation](https://zod.dev/)
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Neon PostgreSQL Hosting](https://neon.tech/docs/introduction)
