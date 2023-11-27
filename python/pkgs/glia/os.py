from typing import Optional

from dotenv import dotenv_values, find_dotenv


def env_to_dict(
    env_files: list[str] | None = None, search_up: list[bool] | None = None
) -> dict[str, str]:
    """Converts environment variables from the specified files into a dictionary.

    Args:
        env_files: List of environment variable files to load. Defaults to ['.env'].
        search_up: List specifying whether to search up the directory tree for each file.
            Defaults to [True] for each file.

    Returns:
        Dictionary containing the environment variables.

    Raises:
        ValueError: If the length of `env_files` is different from the length of `search_up`.

    Examples:
        >>> env_to_dict(['.env', '.env.dev'], [True, False])
        {'VAR1': 'value1', 'VAR2': 'value2'}

    Notes:
        - Uses the `find_dotenv` function from python-dotenv to find the closest environment
          variable files.
    """
    if env_files is None:
        env_files = ['.env']
    if search_up is None:
        search_up = [True for _ in env_files]
    if len(env_files) != len(search_up):
        err_str = (
            f'Env file list (length {len(env_files)}) must be the same length as list '
            'specifying whether to search up the directory tree for each file '
            f'(length {len(search_up)}).'
        )
        raise ValueError(err_str)
    config = {}

    for filename, will_search in zip(env_files, search_up, strict=True):
        if will_search:
            config |= dotenv_values(find_dotenv(filename))
        else:
            config |= dotenv_values(filename)
    return config
