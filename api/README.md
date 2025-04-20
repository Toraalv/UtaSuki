#### Setup:

Any names serves just as an example, rename any if desired.

1. Log into mariadb as root and set up the database:

```sql
CREATE DATABASE utasuki_example;
CREATE USER 'utasuki'@'localhost' IDENTIFIED BY '<your_password>'; # create a user that the api will use
GRANT SELECT, INSERT, UPDATE, DELETE ON utasuki_example.* TO 'utasuki'@'localhost';
FLUSH PRIVILEGES;
```

2. Exit mariadb. Import example database from `resources/`:

```bash
$ mariadb -u root -p<YOUR_PASSWORD> utasuki_example < resources/utasuki_example.sql
```
Alternatively, leave out `<YOUR_PASSWORD>` (but not `-p`), if you wish to not store your password in your shell history.

3. (Optional) Check if everything is working, log in with your newly created user:
```bash
mariadb -u utasuki -p<YOUR_PASSWORD> utasuki_example
```
```sql
SELECT username, email, created FROM users;
# expected output:
# +--------------+-----------------+---------------------+
# | username     | email           | created             |
# +--------------+-----------------+---------------------+
# | user_example | name@domain.tld | 1970-01-01 00:00:00 |
# +--------------+-----------------+---------------------+
```

4. Edit the `.env.example` file. Fill in any blanks and replace any values if you have renamed anything in the previous steps. When done, rename that file to `.env`.

5. Install node modules:
```bash
$ cd api
$ npm install
```

#### Running:

```bash
$ cd api
$ npm run dev
```
