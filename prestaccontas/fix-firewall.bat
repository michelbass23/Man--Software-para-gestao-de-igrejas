@echo off
echo Liberando porta 3000 no Firewall do Windows...
netsh advfirewall firewall add rule name="Next.js Dev Server" dir=in action=allow protocol=TCP localport=3000
echo.
echo Pronto! Pressione qualquer tecla para fechar.
pause > nul
