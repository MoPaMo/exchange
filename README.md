# exchange


### database structure

```sql

CREATE TABLE links (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL, pwd_hash TEXT NOT NULL, joined INTEGER);


```
