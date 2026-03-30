@echo off
title Condo-Manager (Conserje) - Servidor Local
echo ===================================================
echo   INICIANDO CONDO-MANAGER (CONSERJE) LOCALMENTE
echo ===================================================
echo.
echo Iniciando o Backend (Porta 5000)...
start /b cmd /c "pnpm --filter @workspace/api-server dev > api-logs.txt 2>&1"

echo Iniciando o Frontend (Porta 5173)...
start /b cmd /c "pnpm --filter @workspace/conserje dev > web-logs.txt 2>&1"

echo.
echo Servidores iniciados em segundo plano!
echo Aguardando 5 segundos para abrir o navegador...
timeout /t 5 /nobreak >nul

echo Abrindo o sistema no seu navegador padrao...
start http://localhost:5173

echo.
echo Tudo pronto! Pode fechar esta janela se quiser, 
echo os servidores continuarao rodando (ou digite CTRL+C para parar os scripts locais).
pause
