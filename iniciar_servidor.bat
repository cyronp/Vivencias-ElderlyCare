@echo off
chcp 65001 >nul
title Vivencias ElderlyCare - Servidor
color 0B

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo                    VIVENCIAS ELDERLYCARE - SERVIDOR
echo ════════════════════════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo [INFO] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python não encontrado! Por favor, instale o Python 3.8 ou superior.
    echo        Baixe em: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python encontrado!
echo.

echo [INFO] Verificando pacotes necessários...
python -c "import qrcode" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando dependências...
    pip install -r server/requirements.txt
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependências!
        pause
        exit /b 1
    )
    echo [OK] Dependências instaladas!
) else (
    echo [OK] Dependências já instaladas!
)
echo.

echo [INFO] Gerando QR Code para acesso...
python gerar_qrcode.py
echo.

echo ════════════════════════════════════════════════════════════════════════════════
echo                           SERVIDOR INICIANDO...
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo 🌐 Servidor rodando em:
echo    - Local: http://localhost:8000/static/index.html
echo    - Rede:  http://%COMPUTERNAME%:8000/static/index.html
echo.
echo ⚠️  Para parar o servidor, pressione CTRL+C
echo ════════════════════════════════════════════════════════════════════════════════
echo.

python -m uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload

pause
