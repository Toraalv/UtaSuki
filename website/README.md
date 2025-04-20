#### Setup:

```bash
$ cd website
$ npm install
$ cd cert
$ mkcert --install
$ mkcert localhost
$ cp * ../../api/cert/ # api also needs the certificate
```

#### Running:

```bash
$ cd website
$ npm run dev
```
