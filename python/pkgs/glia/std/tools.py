from typing import Generator, NewType, Sequence

TypeOrTypes = Sequence[type] | type
def unnest_sequence(
    seq: Sequence, exact_types: TypeOrTypes | None = None, inexact_types: TypeOrTypes | tuple = (), strat: str = 'depth'
) -> Generator:
    if exact_types is None:
        exact_types = type(seq)

    for x in seq:
        if type(x) == types:
            yield from unnest_sequence(x, types)
        else:
            yield x


def unnest_sequence_depth(seq: Sequence, t: type | None = None) -> Generator:
    if not t:
        t = type(seq)

    for x in seq:
        if type(x) == t:
            yield from unnest_sequence_depth(x, t)
        else:
            yield x


def unnest_sequence_breadth(seq: Sequence, t: type | None = None) -> Generator:
    if not t:
        t = type(seq)

    lst = []
    for x in seq:
        if type(x) == t:
            lst.append(x)
        else:
            yield x
    for x in lst:
        yield from unnest_sequence_breadth(x, t)


def dedent_dict(d: dict):
    for key, value in d.items():
        if isinstance(value, dict):
            d[key] = dedent_dict(value)
        elif isinstance(value, str):
            d[key] = dedent(value).strip('\n')
    return d
