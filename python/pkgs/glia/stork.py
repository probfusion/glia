# ruff: noqa: F841
import gc
from collections.abc import Callable, Generator, Sequence
from contextlib import contextmanager
from functools import partial
from pathlib import Path
from re import T
from textwrap import dedent

import ibis
import ibis.expr.operations as ops
import ibis.expr.types as ir
import pandas as pd
import polars as pl
import pyarrow as pa
from box import Box
from duckdb import DuckDBPyConnection
from ibis.backends.base import BaseBackend
from ibis.expr.types import Table


def create_table(
    manager: Callable, name: str, obj: pd.DataFrame | pa.Table | ir.Table, *args, **kwargs
):
    with manager() as connection:
        create_table_in_schema(connection, name, obj, *args, **kwargs)


def get_table_raw(
    con: DuckDBPyConnection, name: str, namespace: str = 'main', limit: int | None = None
):
    if limit:
        return con.sql(f'SELECT * FROM {namespace}.{name} LIMIT {limit}')
    else:
        return con.sql(f'SELECT * FROM {namespace}.{name}')


def get_table(
    self,
    name: str,
    database: str | None = None,
    schema: str | None = None,
    namespace: ops.Namespace | None = None,
) -> ir.Table:
    """Create a table expression from a table in the database.

    Parameters
    ----------
    name
        Table name
    database
        The database the table resides in
    schema
        The schema inside `database` where the table resides.

        ::: {.callout-warning}
        ## `schema` refers to database hierarchy

        The `schema` parameter does **not** refer to the column names and
        types of `table`.
        :::

    Returns
    -------
    Table
        Table expression
    """
    if namespace is None:
        namespace = ops.Namespace(schema=schema, database=database)

    sqla_table = self._get_sqla_table(name, namespace=namespace)

    schema = self._schema_from_sqla_table(sqla_table, schema=self._schemas.get(name))
    node = ops.DatabaseTable(name=name, schema=schema, source=self, namespace=namespace)
    return node.to_expr()


@contextmanager
def ibis_connect(resource: str, **kwargs) -> Generator:
    """Connection context manager for Ibis connections.

    Example test code:
        df = pd.DataFrame(
            [['a', 1, 2], ['b', 3, 4]],
            columns=['one', 'two', 'three'],
            index=[5, 6],
        )
        t = ibis.memtable(df, name='t')
        with ibis_connect('duckdb://test.duckdb') as conn:
            conn.create_table('b', t.to_pyarrow(), overwrite=True)
            print(conn.tables)

    Optionally:
        del globals()['conn']
        gc.collect()
    """
    connection = ibis.connect(resource, **kwargs)
    yield connection
    connection.con.dispose()
    del connection
    gc.collect()


def generate_connection_manager(resources: str, **kwargs) -> Callable:
    return partial(ibis_connect, resources, **kwargs)


def del_backends(x: dict | list | BaseBackend) -> list:
    """Closes and deletes ibis connections from a dictionary, list, or BaseBackend."""
    has_deleted = False  # More efficiently call the garbage collector
    log = []
    match x:
        case list():
            # Need to make sure to delete AFTER iterating,
            # so can't just recursively call del_backend right away.
            is_to_del = []
            for i in range(len(x)):
                if isinstance(x[i], BaseBackend):
                    is_to_del.append(i)
                else:
                    temp_log = del_backends(x[i])
                    if temp_log:
                        log.append(temp_log)
            for i in is_to_del:
                # Can call del_backends, but to call gc.collect() more efficiently,
                # do this instead:
                x[i].con.dispose()
                del x[i]
                has_deleted = True
                log.append(i)
        case dict():
            # Again, can't just recursively call del_backend right away.
            ks_to_del = []
            for k in x:
                if isinstance(x[k], BaseBackend):
                    ks_to_del.append(k)
                else:
                    temp_log = del_backends(x[k])
                    if temp_log:
                        log.append(temp_log)
            for k in ks_to_del:
                x[k].con.dispose()
                del x[k]
                has_deleted = True
                log.append(k)
        case BaseBackend():
            x.con.dispose()
            del x
            has_deleted = True

    if has_deleted:
        gc.collect()
    return log


del_global_backends = partial(del_backends, globals())

ibis_help = Box(default_box=True)

ibis_help.drop_col = ibis_help.remove_col = """
    Drop 2 columns:
    remaining = t.drop('col1', 'col2')
    subset = t['col3']
    """
ibis_help.create_col = 't.mutate( colx2=t.col*2 )'
ibis_help.modify_col = 't.mutate( two=t.two*2 )'
ibis_help.value_counts = 'includes null'

ibis_help.add_col = "t['col1','col2',new_col]"
ibis_help.rename = ibis_help.rename_col = "t.relabel(dict(one='a',two='b'))"
ibis_help.shape = '( t.count().to_pandas(), len(t.schema()) )'
ibis_help.filter = """
    Can do consecutive. These are the same:
    filtered = penguins[(penguins.bill_length_mm > 37.0) & (penguins.bill_depth_mm > 18.0)]
    filtered = penguins[penguins.bill_length_mm > 37.0][penguins.bill_depth_mm > 18.0]
    """
ibis_help.replace_if = ibis_help.replace_when = ibis_help.modify = """
    Modify column values based on condition
    num_modified = (t.nums > 2).ifelse('big', 'small')
    t.mutate(nums=nums_modified)
    """
ibis_help.tail = 'Reverse sort, then t.head(5)'
ibis_help.sort = """
    To mark descending, use ibis.desc
    sorted = penguins.order_by(["bill_length_mm", ibis.desc("bill_depth_mm")])
    """
ibis_help.agg = """
    agged = penguins.aggregate(
        total_bill_depth=penguins.bill_depth_mm.sum(),
        avg_bill_length=penguins.bill_length_mm.mean(),
    )
    """
ibis_help.groupby = """
    You can use the aggregate `by=` parameter:
    agged = penguins.aggregate(
        by="species",
        total_bill_depth=penguins.bill_depth_mm.sum(),
        avg_bill_length=penguins.bill_length_mm.mean(),
    )

    Or you can use a grouped table:
    agged = penguins.group_by("species").aggregate(
        total_bill_depth=penguins.bill_depth_mm.sum(),
        avg_bill_length=penguins.bill_length_mm.mean(),
    )

    You can group over multiple columns
    penguins.group_by(["species", "sex"], location="island").body_mass_g.approx_median()
    """

ibis_help.groupby_transform = ibis_help.transform = """
    # Calculate how much the mass of each penguin deviates from the mean
    penguins.group_by(["species", "sex"]).mutate(
        mass_mean=penguins.body_mass_g.mean(),
        mass_deviation=penguins.body_mass_g - penguins.body_mass_g.mean(),
    )
    """

ibis_help.dropna = """
    penguins.dropna(["bill_depth_mm", "bill_length_mm"], how="any")
    """
ibis_help.fillna = """
    penguins.bill_length_mm.fillna(0)
    penguins.fillna(dict(bill_depth_mm=0, bill_length_mm=0))
    """
ibis_help.cast = ibis_help.astype = """
    penguins.bill_depth_mm.cast("int")

    casted = penguins.mutate(
        bill_depth_mm=penguins.bill_depth_mm.cast("int"),
        bill_length_mm=penguins.bill_length_mm.cast("int"),
    )
    """
ibis_help['in'] = (
    ibis_help.isin
) = ibis_help.set = 'penguins.species.isin(["Adelie", "Chinstrap"])'

ibis_help.merge = ibis_help.join = """
    t_left.join(t_right, t_left.name == t_right.name)
    t_left.join(t_right, t_left.name == t_right.name, how="outer")
    """

ibis_help.concat = (
    ibis_help.append
) = ibis_help.vstack = ibis_help.union = 'ibis.union(t_1, t_2)'

ibis_help.lazy = ibis_help.print = ibis_help.deferred = """
    Ibis is deferred by default and queries aren't run until you do something like .to_pandas().
    To change this do `ibis.options.interactive = True`
    """

ibis_help.write_table = ibis_help.duckdb = """
    con = ibis.duckdb.connect('test.ddb')
    t = con.create_table('t', ibis_memtable.to_pyarrow(), overwrite=True)
    OR
    con = ibis.connect("duckdb://local.ddb")
    """

ibis_help.disconnect = ibis_help.close = ibis_help.dispose = """
    This has worked before but maybe there's a better way.
    import gc
    con = con.connect('duckdb://placeholder.duckdb')
    gc.collect()

    Alternative that hasn't worked
    del con
    gc.collect()
    """


def dedent_dict(d: dict):
    for key, value in d.items():
        if isinstance(value, dict):
            d[key] = dedent_dict(value)
        elif isinstance(value, str):
            d[key] = dedent(value).strip('\n')
    return d


ibis_help = dedent_dict(ibis_help)


def shape(t: Table) -> tuple:
    return t.count().to_pandas(), len(t.schema())


def sample(t: Table, rows: int = 10) -> tuple:
    return t.sample(rows / t.count().to_pandas())


def read_pl_parquet(path: str | Path, verbose=False, **kwargs) -> tuple[Table, pl.DataFrame]:
    df = pl.read_parquet(path, **kwargs)
    t = ibis.memtable(df, columns=df.columns)
    if verbose:
        print(df.head())
    return t, df


# fmt: off
from typing import Any

import ibis.backends.base.sql.alchemy as bsa
import ibis.common.exceptions as com
import ibis.expr.schema as sch
import ibis.expr.types as ir
import pandas as pd
import pyarrow as pa
import sqlalchemy as sa
from ibis import util


# fmt: on
def _table_in_schema(
    self,
    name: str,
    schema: sch.Schema,
    temp: bool = False,
    database: str | None = None,
    namespace: str | None = None,
    **kwargs: Any,
) -> sa.Table:
    columns = self._columns_from_schema(name, schema)
    return sa.Table(
        name,
        sa.MetaData(schema=namespace),
        *columns,
        prefixes=[self._temporary_prefix] if temp else [],
        quote=self.compiler.translator_class._quote_table_names,
        schema=namespace,
        **kwargs,
    )


def create_table_in_schema(
    self,
    name: str,
    obj: pd.DataFrame | pa.Table | ir.Table | None = None,
    *,
    schema: sch.Schema | None = None,
    database: str | None = None,
    temp: bool = False,
    overwrite: bool = False,
    namespace: str | None = None,
) -> ir.Table:
    """Create a table.

    Parameters
    ----------
    name
        Name of the new table.
    obj
        An Ibis table expression or pandas table that will be used to
        extract the schema and the data of the new table. If not provided,
        `schema` must be given.
    schema
        The schema for the new table. Only one of `schema` or `obj` can be
        provided.
    database
        Name of the database where the table will be created, if not the
        default.
    temp
        Should the table be temporary for the session.
    overwrite
        Clobber existing data

    Returns
    -------
    Table
        The table that was created.
    """
    if obj is None and schema is None:
        raise com.IbisError('The schema or obj parameter is required')

    import pandas as pd
    import pyarrow as pa
    import pyarrow_hotfix  # noqa: F401

    if isinstance(obj, (pd.DataFrame, pa.Table)):
        obj = ibis.memtable(obj)

    if database == self.current_database:
        # avoid fully qualified name
        database = None

    if database is not None:
        raise NotImplementedError(
            'Creating tables from a different database is not yet implemented'
        )

    if obj is not None and schema is not None:
        if not obj.schema().equals(ibis.schema(schema)):
            raise com.IbisTypeError(
                'Expression schema is not equal to passed schema. '
                'Try passing the expression without the schema'
            )
    if schema is None:
        schema = obj.schema()

    self._schemas[self._fully_qualified_name(name, database)] = schema

    if has_expr := obj is not None:
        # this has to happen outside the `begin` block, so that in-memory
        # tables are visible inside the transaction created by it
        self._run_pre_execute_hooks(obj)

    table = _table_in_schema(
        self,
        name,
        schema,
        # most databases don't allow temporary tables in a specific
        # database so let the backend decide
        #
        # the ones that do (e.g., snowflake) should implement their own
        # `create_table`
        database=None if temp else (database or self.current_database),
        temp=temp,
        namespace=namespace,
    )

    if has_expr:
        tmptable = self._table_from_schema(
            util.gen_name('tmp_table_insert'),
            schema,
            # some backends don't support temporary tables
            temp=self.supports_temporary_tables,
        )
        method = self._get_insert_method(obj)
        insert = table.insert().from_select(tmptable.columns, tmptable.select())

        with self.begin() as bind:
            # 1. write `obj` to a unique temp table
            tmptable.create(bind=bind)

        # try/finally here so that a successfully created tmptable gets
        # cleaned up no matter what
        try:
            with self.begin() as bind:
                bind.execute(method(tmptable.insert()))

                # 2. recreate the existing table
                if overwrite:
                    table.drop(bind=bind, checkfirst=True)
                table.create(bind=bind)

                # 3. insert the temp table's data into the (re)created table
                bind.execute(insert)
        finally:
            self._clean_up_tmp_table(tmptable)
    else:
        with self.begin() as bind:
            if overwrite:
                table.drop(bind=bind, checkfirst=True)
            table.create(bind=bind)
    return get_table(
        self,
        name,
        database=database,
        namespace=ops.Namespace(database=database, schema=namespace),
    )
