@echo off
where py >nul 2>nul && (py run_local.py & goto :eof)
python run_local.py
