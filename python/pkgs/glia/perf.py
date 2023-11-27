from pyinstrument import Profiler
from typing import Callable

def profile_func(fn: Callable, fnArgs, profilerArgs)
profiler = Profiler()
profiler.start()

# code you want to profile

profiler.stop()

profiler.print()
