# 🐍 mamba/conda 🐍 environments

## general

i like using mamba.

## commands

### use with pwsh instead of powershell

just run `mamba init powershell`. it should create the appropriate `profile.ps1` file

### 🎁 export

favorite export command:

```shell
conda env export --from-history | grep -v "prefix" > myenv.yml
```

exports only explicitly installed packages without the prefix (which tells mamba a path to create the environment in).
see <https://github.com/conda/conda/issues/4339> for more details.

other commands (if using in cmd, copying comments will cause an error):

```shell
mamba env export -f myenv.yml # with myenv activated
mamba env export -n myenv2 -f myenv2.yml # without myenv2 activated
mamba env export --no-builds # without build suffix, but with version numbers
mamba env export | cut -f-2 -d '=' # also exports without build suffices
mamba env export | cut -f-1 -d '=' # export without version numbers
mamba env export | grep -v "prefix" # export without prefix
mamba env export | findstr -v "prefix" # export without prefix on windows (you should install grep with scoop!)
conda env export -n myenv | cut -f-1 -d '=' | grep -v "prefix" > myenv.yml # combined
mamba env export --from-history # only export explicitly installed packages
```

### 🏗️ import

```shell
mamba env create -f env_spec.yml # into current environment
mamba env create -f env_spec.yml -n new_env_name # into new environment
```

### other

get dependencies of a conda package

```shell
mamba repoquery depends -t -c conda-forge pkg_name # primary command
mamba repoquery depends urllib3
mamba repoquery depends -t httpx # recursive dependencies with tree view
```

get dependencies of a pip-only package using johnnydep package

```shell
johnnydep jupyterlab
```

### favorite packages 🥰📦📦📦

#### new environments

```yaml
numpy
pandas
jupyterlab
scipy
matplotlib
seaborn
nptyping # better numpy and pandas type hinting
beartype # fast runtime type checking with validation
pydantic # data validation
urllib3 # better urllib
httpx # async requests
johnnydep # dependency tree for pip and if mamba repoquery doesn't work
pipreqs # pip requirements.txt generator based on imports in project
isort # sort imports automatically
black # format python files

```

#### ai, ml, data science

install cuda ([windows instructions](https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html), [linux instructions](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html))

check [pytorch](https://pytorch.org/get-started/locally/) and [jax](https://github.com/google/jax#installation) installation instructions
jax is for linux only, if on windows use wsl.

```yaml
# data
ydata-profiling # automatic eda

# visualization
streamlit
plotly
altair
vega_datasets
```

has extra requirements:

```yaml
# bayesian
numpyro # have jaxlib installed properly first
pymc>=4 # have numpyro installed first
```

#### scraping

```yaml
beautifulsoup4 # standard
selenium # standard
selectolax # faster beautifulsoup4
playwright # better selenium
```
