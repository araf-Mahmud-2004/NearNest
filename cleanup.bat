@echo off
echo Cleaning up unnecessary files from NearNest project...

REM Remove unused components
if exist "src\components\Navigation.tsx" (
    del "src\components\Navigation.tsx"
    echo Removed Navigation.tsx
)

if exist "src\components\TestTracking.tsx" (
    del "src\components\TestTracking.tsx"
    echo Removed TestTracking.tsx
)

REM Remove unused pages
if exist "src\pages\Index.tsx" (
    del "src\pages\Index.tsx"
    echo Removed Index.tsx
)

REM Remove unused CSS
if exist "src\App.css" (
    del "src\App.css"
    echo Removed App.css
)

REM Remove Bun lock file if using npm
if exist "bun.lockb" (
    del "bun.lockb"
    echo Removed bun.lockb
)

REM Remove placeholder files
if exist "public\placeholder.svg" (
    del "public\placeholder.svg"
    echo Removed placeholder.svg
)

REM Remove this cleanup script and list
if exist "CLEANUP_LIST.md" (
    del "CLEANUP_LIST.md"
    echo Removed CLEANUP_LIST.md
)

if exist "cleanup.bat" (
    del "cleanup.bat"
    echo Removed cleanup.bat
)

echo.
echo Cleanup completed! Removed unnecessary files.
echo.
pause