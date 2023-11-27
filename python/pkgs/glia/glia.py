#!/usr/bin/env conda run -n rush10 --live-stream python -i

from typing import Any

from glia.types import ArgSequence, ConditionChecker


def handle_allow_deny(
    item: Any,
    allow_fn: ConditionChecker,
    deny_fn: ConditionChecker,
    allow_args: ArgSequence | None = None,
    deny_args: ArgSequence | None = None,
) -> bool:
    match allow_args, deny_args:
        case None, None:
            raise ValueError

    is_allowed = any(allow_fn(item) for args, kwargs in allow_args)

    for a in allow_args:
        print('hi')
    return False


if __name__ == '__main__':
    print('hi')
