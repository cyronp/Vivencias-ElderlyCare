"""
Script para testar e exibir QR Code para acesso ao sistema
"""
import socket
import qrcode

def get_local_ip():
    """Obtém o IP local da máquina"""
    try:
        # Cria um socket para descobrir o IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return socket.gethostbyname(socket.gethostname())

def generate_qr_code(url):
    """Gera e exibe QR Code no terminal"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=1,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    print('\n' + '═' * 80)
    print('              ACESSE O SISTEMA PELO SEU CELULAR (mesma rede)')
    print('═' * 80 + '\n')
    
    qr.print_ascii(invert=True)
    
    print(f'\n📱 URL: {url}\n')
    print('💡 Dica: Escaneie o QR Code acima com a câmera do seu celular!')
    print('═' * 80 + '\n')

if __name__ == "__main__":
    ip = get_local_ip()
    port = 8000
    url = f"http://{ip}:{port}/static/index.html"
    
    print(f"\n🌐 IP Local detectado: {ip}")
    generate_qr_code(url)
    
    print("URLs de acesso:")
    print(f"  - Local:      http://localhost:{port}/static/index.html")
    print(f"  - Rede/Mobile: {url}")
    print()
