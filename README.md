# 歌好き (UtaSuki)
The site is available at [utasuki.com](https://utasuki.com).

Current features:
- [x] User registration
- [x] Adding tracks
- [x] Changing user settings, such as profile picture, username and publicity.
- [x] Password encryption (salting + hashing)

Current plans includes:
- [ ] Editing, removing tracks
- [ ] More user settings, delete account
- [ ] Improving UX
- [ ] CI/CD
- [ ] Unit testing
- [ ] Some sort of common music library
- [ ] User interaction, such as adding each other as friends
- [ ] User statistics
- [ ] Mobile phone support

## Development

### Prerequisites

- A node package manager. [`npm`](https://github.com/npm/cli) will be used as an example
- [`mkcert`](https://github.com/FiloSottile/mkcert) -- used to create and install local CA and certificates
- [MariaDB](https://mariadb.org/) -- the used database system

### Setup

UtaSuki is divided into two parts, a [Svelte](https://svelte.dev/) web server and a [Node.js](https://nodejs.org/) REST API. Their respective setup can be found here:

[Svelte web server](/website/README.md)

[API](/api/README.md)
