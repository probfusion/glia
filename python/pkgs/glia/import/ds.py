import math
import os
import pickle
import re
import uuid
from dataclasses import dataclass
from importlib import reload
from typing import Callable

import altair as alt
import ipywidgets as widgets
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import panel as pn
import param
import seaborn as sns
import utils.combine as comb
import utils.sample_logic as slog
from param import Parameter, Parameterized
from scipy import stats
from scipy.integrate import quad, simpson
from scipy.optimize import fsolve, least_squares
from scipy.signal import find_peaks
from scipy.stats import beta, norm, truncnorm, uniform
from tqdm import tqdm
from utils.dist import beta_params_from_mode_k, beta_params_from_mu_sd, cdf_from_sample
from pathlib import Path
from datetime import datetime, date


import sys
from importlib import reload

tqdm.pandas()
pd.set_option('display.max_columns', 500)
pd.set_option('display.max_colwidth', 150)


ROOT_PATH = Path('..')
CURR_PATH = Path('.')
DATA_PATH = ROOT_PATH / 'data'
if not DATA_PATH.exists():
    DATA_PATH.mkdir(parents=True)

DATA_VERSION_PATH = DATA_PATH / 'versioned'
if not DATA_VERSION_PATH.exists():
    DATA_VERSION_PATH.mkdir(parents=True)

%load_ext line_profiler
