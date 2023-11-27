# Examples

## Stork (Ibis Helper Module)

```python
raw_space = ops.Namespace(database='mydb', schema='raw')
sk.get_table(con, 'mytable', namespace=raw_space)
```

Connection

```python
sk.del_backends(globals())
con = ibis.duckdb.connect(DATA_PATH / 'mydb.duckdb')
con.list_tables(), con.list_schemas()
```

Creation

```python
ns = ops.Namespace(database='mydb', schema='mynamespace')
sk.create_table_in_schema(con, name='mytable', obj=t, namespace=ns)
```

## Duckdb

```python
con = duckdb.connect(str(DATA_PATH / 'mydb.duckdb'))
tmp = con.sql('SELECT * FROM namespace.mytable LIMIT 10')
t = ibis.memtable(tmp.df(), schema=some_schema)
```
