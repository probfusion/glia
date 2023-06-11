import json

import numpy as np
from beartype import beartype
from nptyping import Int, NDArray, Shape

TYPE_GRID = NDArray[Shape["*, *"], Int]


@beartype
def reiterate_grid(grid: TYPE_GRID) -> TYPE_GRID:
    """
    The function reiterate_grid takes in a 2D numpy array and returns a new array with monotonically increasing ID,
    taking into account to the unique IDs in the input grid.

    Parameters
    ----------
    grid
        a 2D numpy array of integers representing a grid of IDs.

    Returns
    -------
    TYPE_GRID
        A numpy array of monotonically increasing ids with the same shape as the input `grid`.
    """
    flat_grid = grid.flatten()
    unique_ids, unique_inds = np.unique(flat_grid, return_index=True)

    # sort the unique ids by their unique indices
    dtype = [("id", int), ("ind", int)]  # create a dtype for sorting purposes
    unique_grid = np.array(list(zip(unique_ids, unique_inds)), dtype=dtype)
    sorted_grid = np.sort(unique_grid, order="ind")

    new_ids = np.arange(sorted_grid.size)  # have new ids be monotonically increasing
    id_map = {old: new for (old, _), new in zip(sorted_grid, new_ids)}
    new_grid = np.array([id_map[old] for old in flat_grid])

    return new_grid.reshape(grid.shape)


if __name__ == "__main__":
    f = open("custom-layouts.json")
    data = json.load(f)
    layouts = data["custom-layouts"].copy()
    for i, layout in enumerate(layouts):
        grid = np.array(layout["info"]["cell-child-map"])
        new_grid = reiterate_grid(grid)
        data["custom-layouts"][i]["info"]["cell-child-map"] = new_grid.tolist()

    with open("custom-layouts_reindexed.json", "w", encoding="utf-8") as output:
        json.dump(data, output, ensure_ascii=False, indent=2)
