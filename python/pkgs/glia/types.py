from collections.abc import Callable, Mapping, Sequence
from typing import Any

ConditionChecker = Callable[..., bool]
OptArgs = Sequence | None
OptKwargs = Mapping[str, Any] | None
OptArgKwargs = tuple[OptArgs, OptKwargs] | None
ArgSequence = Sequence[OptArgKwargs]
