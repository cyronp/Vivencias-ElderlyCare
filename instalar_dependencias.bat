@echo off
chcp 65001 >nul
title Instalar Dependências - Vivencias ElderlyCare
color 0E

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo              INSTALAÇÃO DE DEPENDÊNCIAS - VIVENCIAS ELDERLYCARE
echo ════════════════════════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo [INFO] Verificando Python...
python --version
if errorlevel 1 (
    echo.
    echo [ERRO] Python não encontrado!
    echo.
    echo Por favor, instale o Python 3.8 ou superior:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANTE: Durante a instalação, marque a opção:
    echo ☑️  "Add Python to PATH"
    echo.
    pause
    exit /b 1
)
echo.

echo [INFO] Instalando pacotes Python...
echo.
pip install -r server/requirements.txt

if errorlevel 1 (
    echo.
    echo [ERRO] Falha na instalação!
    echo.
    echo Tente executar como Administrador:
    echo 1. Clique com botão direito neste arquivo
    echo 2. Escolha "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo                        ✅ INSTALAÇÃO CONCLUÍDA!
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo Agora você pode executar o servidor usando:
echo    📂 iniciar_servidor.bat
echo.
pause
