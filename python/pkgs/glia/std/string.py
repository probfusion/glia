from textwrap import dedent


def dd(x: str) -> str:
    """Dedents a string and strips leading/trailing whitespace.

    Args:
        x: The string to dedent and strip.

    Returns:
        The dedented and stripped string.
    """
    return dedent(x).strip()
